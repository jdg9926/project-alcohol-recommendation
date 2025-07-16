const API_BASE_URL = "http://localhost:8888";
// const API_BASE_URL = "http://192.168.3.24:8888";

// ✅ 아이디 중복 확인
export const checkUserIdDuplicate = async (userId, setIsUserIdChecked) => {
    console.log("userId ::", userId);
    // 🚩 여기에 금지어/형식 검사 먼저!
    if (!userId || userId.trim() === "") {
        alert("아이디를 입력해주세요.");
        return;
    }
    if (userId.toLowerCase().includes("admin")) {
        alert("사용할 수 없는 아이디입니다.");
        return;
    }
    if (userId.length < 6 || userId.length > 16 || !/^[a-zA-Z0-9]+$/.test(userId)) {
        alert("아이디는 6~16자 영문/숫자만 가능합니다.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/check-id?userId=${userId}`);
        const exists = await res.json();

        alert(exists ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다!');

        // 상태 반영
        if (!exists) setIsUserIdChecked(true);
    } catch (err) {
        console.error('아이디 중복 확인 오류:', err);
        alert("중복 확인 중 오류가 발생했습니다.");
    }
};

// ✅ 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname, setIsNicknameChecked) => {
    if (!nickname || nickname.trim() === "") {
        alert("닉네임을 입력해주세요.");
        return;
    }
    if (nickname.includes("관리자") || nickname.includes("운영자")) {
        alert("사용할 수 없는 닉네임입니다.");
        return;
    }
    if (nickname.length < 6 || nickname.length > 16 || !/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
        alert("닉네임은 6~16자 한글/영문/숫자만 가능합니다.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/check-nickname?nickname=${nickname}`);
        const exists = await res.json();
        alert(exists ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다!');

        // 상태 반영
        if (!exists) setIsNicknameChecked(true);
    } catch (err) {
        console.error('닉네임 중복 확인 오류:', err);
        alert("중복 확인 중 오류가 발생했습니다.");
    }
};

export const verifyEmailCode = async (form, setIsEmailVerified) => {
    const email = getEmail(form);

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                code: form.duplicateCode,
            }),
        });

        const result = await res.json();

        if (res.ok && result.success) {
            alert("인증 성공");
            setIsEmailVerified(true);
        } else {
            alert("인증번호가 일치하지 않거나 만료되었습니다.");
            setIsEmailVerified(false);
        }
    } catch (err) {
        console.error('이메일 인증 오류:', err);
        alert("서버 오류");
        setIsEmailVerified(false);
    }
};

// ✅ 이메일 주소 조합 함수
export const getEmail = (form) => {
    return form.emailDomain === 'custom'
        ? `${form.emailId}@${form.customDomain}`
        : `${form.emailId}@${form.emailDomain}`;
};

// ✅ 이메일 인증번호 전송 API
export const sendVerificationCodeApi = async (email) => {
    const res = await fetch(`${API_BASE_URL}/api/users/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '인증번호 전송 실패');
    return data.code; // 서버에서 인증코드 반환 (개발용)
};