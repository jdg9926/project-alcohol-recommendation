// src/api/token.js
// 탭 4칸
let inMemoryAccessToken = null;
const STORAGE_KEY = "token";

/** 토큰 저장/제거(메모리 + localStorage 동기화) */
export function setAccessToken(token) {
    if (token) {
        inMemoryAccessToken = token;
        localStorage.setItem(STORAGE_KEY, token);
    } else {
        inMemoryAccessToken = null;
        localStorage.removeItem(STORAGE_KEY);
    }
    // 탭 간 동기화를 위해 커스텀 이벤트 발행(선택)
    try {
        window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: { token: inMemoryAccessToken } }));
    } catch {}
}

export function getAccessToken() {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    const t = localStorage.getItem(STORAGE_KEY);
    inMemoryAccessToken = t;
    return t;
}

export function clearAccessToken() {
    setAccessToken(null);
}

/** base64url → JSON */
export function decodeJwt(token) {
    try {
        const [, payload] = token.split(".");
        // base64url 안전 변환: '-'→'+', '_'→'/', padding 보정
        const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const pad = "=".repeat((4 - (b64.length % 4)) % 4);
        return JSON.parse(atob(b64 + pad));
    } catch {
        return null;
    }
}

/** 만료 여부(기본 30초 스큐) */
export function isExpired(token, skewSeconds = 30) {
    const payload = decodeJwt(token);
    if (!payload?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now <= skewSeconds;
}

/** exp(ms) 반환 — 기존 버전은 base64url 미처리였음 → decodeJwt 재사용 */
export function getTokenExpiry() {
    const token = getAccessToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload?.exp ? payload.exp * 1000 : null; // ms
}

/** iat(ms) 필요할 때 */
export function getTokenIssuedAt() {
    const token = getAccessToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload?.iat ? payload.iat * 1000 : null;
}

/** 만료 임박 여부(임계값 ms) */
export function shouldRefreshSoon(thresholdMs = 60 * 1000) {
    const exp = getTokenExpiry();
    if (!exp) return false;
    return exp - Date.now() < thresholdMs;
}

/** (선택) 다른 탭에서 로그아웃/로그인 동기화 */
export function bindStorageSync() {
    const onStorage = (e) => {
        if (e.key === STORAGE_KEY) {
            inMemoryAccessToken = e.newValue;
            try {
                window.dispatchEvent(new CustomEvent("auth:token-changed", { detail: { token: inMemoryAccessToken } }));
            } catch {}
        }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
}
