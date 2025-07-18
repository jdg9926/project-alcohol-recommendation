import { BASE_URL } from "./baseUrl";

export async function signup({ userId, nickname, password, email }) {
    const res = await fetch(`${BASE_URL}:8888/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            userId,
            nickname,
            email,
            password,
        })
    });

    const data = await res.json(); // 한 번만 읽기
    
    if (!res.ok) {
        // 백엔드가 내려준 에러 메시지를 포함한 ErrorResponse 객체에서 message 꺼내 던지기
        throw new Error(data.message || `Signup failed: ${res.status}`);
    }
    return data;
}

// 아이디 중복 확인
export async function checkUserId(userId) {
  const res = await fetch(`/api/users/check-id?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '아이디 중복 확인 실패');
  return data; // true / false
}

// 닉네임 중복 확인
export async function checkNickname(nickname) {
  const res = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '닉네임 중복 확인 실패');
  return data; // true / false
}

// 이메일 인증번호 전송
export async function sendVerificationCode(email) {
    const res = await fetch(`/api/users/send-verification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '인증번호 전송 실패');
    return data.code; // 인증코드 (테스트용), 또는 success 메시지
}

// 이메일 인증번호 검증
export async function verifyEmailCode(email, code) {
    const res = await fetch(`/api/users/verify-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '인증 실패');
    return data.success; // true / false
}

export async function login({ userId, password }) {
    const res = await fetch(`${BASE_URL}:8888/api/auth/login`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
            userId, 
            password 
        })
    });

    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.message || '로그인 실패');
    }

    localStorage.setItem('token', body.token);
    localStorage.setItem('user', JSON.stringify(body.user));
    
    return body;  // 토큰과 유저를 함께 반환
}

export async function getMe() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('로그인 토큰이 없습니다.');
    }

    
    const res = await fetch(`${BASE_URL}:8888/api/auth/me`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    });

    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.message || `회원 정보 조회 실패: ${res.status}`);
    }

    return body;
}
