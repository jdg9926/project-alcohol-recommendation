import { getAccessToken, setAccessToken, clearAccessToken, getTokenExpiry } from "./token";

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL ?? "").replace(/\/$/, "");
const REFRESH_THRESHOLD_MS = 60 * 1000; // 만료 1분 전 갱신

export async function api(path, options = {}) {
    const {
        method = "GET",
        headers = {},
        body,
        timeoutMs = 10000,
        asForm = false,
        baseUrl = API_BASE_URL,
        withRefresh = true,
        credentials,
    } = options;

    const url = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // 1️⃣ 요청 전에 토큰 만료 임박하면 선제 갱신
        if (withRefresh && await shouldRefreshToken()) {
            await tryRefreshToken();
        }

        // 2️⃣ 최초 요청
        const response = await doFetch(url, {
            method,
            headers,
            body,
            asForm,
            credentials,
            signal: controller.signal
        });

        // 3️⃣ 401 → refresh 후 1회 재시도
        if (response.status === 401 && withRefresh && await tryRefreshToken()) {
            return await doFetch(url, {
                method,
                headers,
                body,
                asForm,
                credentials,
                signal: controller.signal,
                skipTokenCheck: true
            }).then(parseOrThrow);
        }

        return await parseOrThrow(response);
    } finally {
        clearTimeout(timer);
    }
}

/** 공통 fetch 처리 */
async function doFetch(url, { method, headers, body, asForm, credentials, signal, skipTokenCheck = false }) {
    const finalHeaders = { ...headers };

    if (!skipTokenCheck) {
        const token = getAccessToken();
        if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
    }
    if (!asForm && !finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
    }

    return fetch(url, {
        method,
        headers: finalHeaders,
        body: asForm ? body : (body ? JSON.stringify(body) : undefined),
        credentials,
        signal
    });
}

/** 응답 파싱 및 에러 처리 */
async function parseOrThrow(res) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const data = isJson
        ? await res.json().catch(() => ({}))
        : await res.text();

    if (!res.ok) {
        const message = typeof data === "string" ? data : (data?.message ?? res.statusText);
        const err = new Error(message || "Request failed");
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

/** 토큰 만료 임박 여부 확인 */
async function shouldRefreshToken() {
    const expiry = getTokenExpiry(); // 토큰 만료 시간 (ms)
    if (!expiry) return false;
    const now = Date.now();
    return expiry - now < REFRESH_THRESHOLD_MS;
}

/** 쿠키 기반 refresh */
async function tryRefreshToken() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return false;

        const data = await res.json();
        if (!data?.accessToken) return false;

        setAccessToken(data.accessToken);
        return true;
    } catch {
        clearAccessToken();
        return false;
    }
}
