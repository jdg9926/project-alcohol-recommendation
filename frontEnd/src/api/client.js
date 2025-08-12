// src/api/client.js
import { getAccessToken, setAccessToken, clearAccessToken, shouldRefreshSoon } from "./token";

/** ===== 기본 설정 ===== */
const RAW_BASE = process.env.REACT_APP_API_BASE_URL ?? "";
const API_BASE_URL = RAW_BASE.replace(/\/$/, ""); // 끝 슬래시 제거
const REFRESH_THRESHOLD_MS = 60 * 1000; // 만료 1분 전 선제 갱신(shouldRefreshSoon 기본값과 일치)
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_RETRIES = 1; // 429/5xx 재시도 최대 횟수

/** 디버그 스위치: ?debug=1 또는 localStorage.DEBUG = "1" */
const DEBUG = (() => {
    try {
        const u = new URL(window.location.href);
        if (u.searchParams.get("debug") === "1") return true;
        return localStorage.getItem("DEBUG") === "1";
    } catch {
        return false;
    }
})();

/** ===== 유틸 ===== */
function logDebug(...args) {
    if (DEBUG) console.log("[API]", ...args);
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function isBodyBinaryLike(body) {
    return (
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof URLSearchParams
    );
}

/** ===== 공개 API =====
 * api(path, {
 *     method = "GET",
 *     headers = {},
 *     body,
 *     timeoutMs = DEFAULT_TIMEOUT_MS,
 *     asForm = false,                 // FormData/URLSearchParams 사용시 true 권장
 *     baseUrl = API_BASE_URL,
 *     withRefresh = true,             // 401 시 리프레시 재시도
 *     credentials,                    // 필요시 'include' 등 전달
 *     retries = 0                     // 429/5xx 재시도 횟수(기본 0)
 * })
 */
export async function api(path, options = {}) {
    const {
        method = "GET",
        headers = {},
        body,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        asForm = false,
        baseUrl = API_BASE_URL,
        withRefresh = true,
        credentials,
        retries = 0
    } = options;

    const url = `${baseUrl}${path}`;

    // 1) 선제 리프레시 (만료 임박 시)
    if (withRefresh && shouldRefreshSoon(REFRESH_THRESHOLD_MS)) {
        await tryRefreshToken();
    }

    // 2) 1차 요청
    let res = await doFetch(url, { method, headers, body, asForm, credentials, timeoutMs });

    // 3) 401 → 리프레시 성공 시 1회 재시도
    if (res.status === 401 && withRefresh && await tryRefreshToken()) {
        res = await doFetch(url, { method, headers, body, asForm, credentials, timeoutMs, skipTokenCheck: true });
    }

    // 4) 429/5xx 백오프 재시도(옵션)
    let attempt = 0;
    while (shouldRetryStatus(res.status) && attempt < Math.min(retries, MAX_RETRIES)) {
        const wait = backoff(attempt);
        logDebug(`retry ${attempt + 1} after ${wait}ms for ${res.status} ${url}`);
        await sleep(wait);
        res = await doFetch(url, { method, headers, body, asForm, credentials, timeoutMs, skipTokenCheck: true });
        attempt++;
    }

    return await parseOrThrow(res);
}

/** 메서드 헬퍼 */
api.get = (path, opts = {}) => api(path, { ...opts, method: "GET" });
api.post = (path, body, opts = {}) => api(path, { ...opts, method: "POST", body });
api.put = (path, body, opts = {}) => api(path, { ...opts, method: "PUT", body });
api.patch = (path, body, opts = {}) => api(path, { ...opts, method: "PATCH", body });
api.delete = (path, opts = {}) => api(path, { ...opts, method: "DELETE" });

/** ===== 내부 구현 ===== */

/** 공통 fetch (타임아웃/토큰/헤더/바디 구성) */
async function doFetch(url, { method, headers, body, asForm, credentials, timeoutMs, skipTokenCheck = false }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const finalHeaders = { ...headers };

        // Authorization
        if (!skipTokenCheck) {
            const token = getAccessToken();
            if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
        }

        // Content-Type: JSON 기본, 단 FormData/바이너리나 asForm일 땐 자동 설정에 맡김
        let reqBody = undefined;
        if (body !== undefined) {
            if (asForm || isBodyBinaryLike(body)) {
                reqBody = body;
                // FormData/URLSearchParams일 경우 Content-Type을 명시하지 않음(브라우저가 boundary 포함하여 설정)
                if (finalHeaders["Content-Type"] && (body instanceof FormData || body instanceof URLSearchParams)) {
                    delete finalHeaders["Content-Type"];
                }
            } else {
                finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
                reqBody = typeof body === "string" ? body : JSON.stringify(body);
            }
        }

        const reqInit = {
            method,
            headers: finalHeaders,
            body: reqBody,
            signal: controller.signal
        };

        // 필요할 때만 credentials 지정(쿠키 기반 엔드포인트 등)
        if (credentials) reqInit.credentials = credentials;

        logDebug("REQ", { url, method, headers: finalHeaders, hasBody: !!reqBody });

        const res = await fetch(url, reqInit);
        logDebug("RES", { url, status: res.status });
        return res;
    } catch (e) {
        logDebug("THROW", { url, error: e });
        throw decorateNetworkError(e);
    } finally {
        clearTimeout(timer);
    }
}

/** 응답 파싱 + 에러 throw */
async function parseOrThrow(res) {
    // 204/205 No Content 대응
    if (res.status === 204 || res.status === 205) return null;

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json") || contentType.includes("application/problem+json");

    let data = null;
    try {
        data = isJson ? await res.json() : await res.text();
    } catch {
        // 본문이 비어있거나 JSON 파싱 실패 → data는 null 유지
    }

    if (!res.ok) {
        const message = typeof data === "string" ? data : (data?.message || data?.error || res.statusText);
        const err = new Error(message || "Request failed");
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

/** 리프레시 토큰(쿠키 기반) */
async function tryRefreshToken() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });
        if (!res.ok) return false;

        const data = await res.json().catch(() => null);
        if (!data?.accessToken) return false;

        setAccessToken(data.accessToken);
        logDebug("REFRESH OK");
        return true;
    } catch (e) {
        logDebug("REFRESH FAIL", e);
        clearAccessToken();
        return false;
    }
}

/** 재시도 대상 상태코드 */
function shouldRetryStatus(status) {
    if (!status) return false;
    return status === 429 || (status >= 500 && status < 600);
}

/** 지수 백오프(ms) */
function backoff(attempt) {
    // 500ms, 1000ms ...
    return 500 * Math.pow(2, attempt);
}

/** 네트워크 에러 메시지 정규화 */
function decorateNetworkError(e) {
    if (e?.name === "AbortError") {
        const err = new Error("요청이 시간 초과되었습니다.");
        err.code = "TIMEOUT";
        return err;
    }
    return e;
}
