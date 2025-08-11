import axios from "axios";
import { api } from "./client";

export async function signup({ userId, nickname, password, email }) {
    return api("/api/auth/signup", {
        method: "POST",
        body: { userId, nickname, password, email }
    });
}

export async function login({ userId, password }) {
    console.log("Logging in with userId:", userId); // 디버깅용 로그
    return api("/api/auth/login", {
        method: "POST",
        body: { userId, password }
    });
}

export async function getMe(token) {
    return api("/api/auth/me", {
        method: "GET",
        token
    });
}

// 아래와 같은 사용자 관련 API도 모두 동일 패턴으로 통일
export async function checkUserIdDuplicate(userId) {
    return api(`/api/users/check-id?userId=${encodeURIComponent(userId)}`);
}
export async function checkNicknameDuplicate(nickname) {
    return api(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
}
export async function sendVerificationCodeApi({ email }) {
    return api("/api/users/send-verification", {
        method: "POST",
        body: { email }
    });
}
export async function verifyEmailCode({ email, code }) {
    return api("/api/users/verify-code", {
        method: "POST",
        body: { email, code }
    });
}

export async function refreshToken() {
    const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include", // refreshToken 쿠키 전달
    });
    if (!res.ok) throw new Error("Refresh Token 요청 실패");
    const data = await res.json();
    return data.accessToken; // 서버에서 새 accessToken 반환한다고 가정
}

export async function resetPasswordApi({ email, code, newPassword }) {
    try {
        const response = await axios.post("/auth/reset-password", {
            email,
            code,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "비밀번호 재설정 실패" };
    }
}