// src/api/auth.js
import { api } from "./client";

/** 공통 BASE (client.js와 동일 규칙) */
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL ?? "").replace(/\/$/, "");

/** 회원가입 */
export async function signup({ userId, nickname, password, email }) {
    return api("/api/auth/signup", {
        method: "POST",
        body: { userId, nickname, password, email }
    });
}

/** 로그인: 새 refresh 쿠키를 받아야 하므로 credentials 포함, withRefresh 끔 */
export async function login({ userId, password }) {
    return api("/api/auth/login", {
        method: "POST",
        body: { userId, password },
        credentials: "include",      // ✅ refresh 쿠키 세팅
        withRefresh: false           // ✅ 로그인 중엔 이전 쿠키로 리프레시 금지
    });
}

/** 로그아웃: 서버 쿠키 삭제 호출 + withRefresh 끔 */
export async function logoutApi() {
    return api("/api/auth/logout", {
        method: "POST",
        credentials: "include",      // ✅ 서버의 refresh 쿠키 제거를 위해 필수
        withRefresh: false           // ✅ 로그아웃 중엔 리프레시 금지
    });
}

/** 내 정보 조회 (Bearer 자동 첨부) */
export async function getMe() {
    return api("/api/auth/me", { method: "GET" });
}

/** 아이디 중복확인 */
export async function checkUserIdDuplicate(userId) {
    return api(`/api/users/check-id?userId=${encodeURIComponent(userId)}`, { method: "GET" });
}

/** 닉네임 중복확인 */
export async function checkNicknameDuplicate(nickname) {
    return api(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`, { method: "GET" });
}

/** 인증코드 메일 발송 */
export async function sendVerificationCodeApi({ email }) {
    return api("/api/users/send-verification", {
        method: "POST",
        body: { email }
    });
}

/** 이메일 인증코드 검증 */
export async function verifyEmailCode({ email, code }) {
    return api("/api/users/verify-code", {
        method: "POST",
        body: { email, code }
    });
}

/**
 * Refresh Token으로 Access Token 갱신
 * - HttpOnly 쿠키 기반이라 fetch를 직접 사용 (api()는 Authorization을 자동 첨부하기 때문)
 * - 서버 응답: { accessToken: "..." } 형태 가정
 */
export async function refreshToken() {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) {
        throw new Error("Refresh Token 요청 실패");
    }
    const data = await res.json().catch(() => ({}));
    return data?.accessToken;
}

/** 비밀번호 재설정 (메일 토큰/코드 기반) */
export async function resetPasswordApi({ email, code, newPassword }) {
    return api("/api/auth/reset-password", {
        method: "POST",
        body: { email, code, newPassword }
    });
}
