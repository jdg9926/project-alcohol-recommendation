// 탭 4칸
let inMemoryAccessToken = null;
const STORAGE_KEY = "token";

export function setAccessToken(token) {
	if (token) {
		inMemoryAccessToken = token;
		localStorage.setItem(STORAGE_KEY, token);
	} else {
		inMemoryAccessToken = null;
		localStorage.removeItem(STORAGE_KEY);
	}
}

export function getAccessToken() {
	if (inMemoryAccessToken) return inMemoryAccessToken;
	const t = localStorage.getItem(STORAGE_KEY);
	inMemoryAccessToken = t;
	return t;
}

export function clearAccessToken() {
	inMemoryAccessToken = null;
	localStorage.removeItem(STORAGE_KEY);
}

export function decodeJwt(token) {
	try {
		const [, payload] = token.split(".");
		return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
	} catch {
		return null;
	}
}

export function isExpired(token, skewSeconds = 30) {
	const payload = decodeJwt(token);
	if (!payload?.exp) return false;
	const now = Math.floor(Date.now() / 1000);
	return payload.exp - now <= skewSeconds;
}

export function getTokenExpiry() {
    const token = getAccessToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null; // exp는 초 단위
    } catch {
        return null;
    }
}