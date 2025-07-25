import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import './Auth.css';

import {
    checkUserIdDuplicate,
    checkNicknameDuplicate,
    sendVerificationCodeApi,
    verifyEmailCode,
} from './SignupActive';

function validateUserId(userId) {
    if (!userId.trim()) return "아이디를 입력하세요.";
    if (userId.length < 6 || userId.length > 16) return "아이디는 6~16자여야 합니다.";
    if (!/^[a-zA-Z0-9]+$/.test(userId)) return "아이디는 영문과 숫자만 가능합니다.";
    if (userId.toLowerCase() === "admin") return "사용할 수 없는 아이디입니다.";
    return null;
}

function validateNickname(nickname) {
    if (!nickname.trim()) return "닉네임을 입력하세요.";
    if (nickname.length < 2 || nickname.length > 16) return "닉네임은 2~16자여야 합니다.";
    if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) return "닉네임은 한글, 영문, 숫자만 가능합니다.";
    if (nickname === "관리자") return "사용할 수 없는 닉네임입니다.";
    return null;
}

function validatePassword(password, userId) {
    if (!password) return "비밀번호를 입력하세요.";
    if (password.length < 8) return "비밀번호는 8자리 이상이어야 합니다.";
    if (!/[~!@#$%^&*()_\-+={};':"\\|,.<>/?]/.test(password)) return "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
    if (/\s/.test(password)) return "비밀번호에 공백은 사용할 수 없습니다.";
    if (userId === password) return "아이디와 비밀번호가 같을 수 없습니다.";
    return null;
}

function validatePasswordCheck(password, passwordCheck) {
    if (password !== passwordCheck) return "비밀번호가 일치하지 않습니다.";
    return null;
}

function validateEmail(form) {
    if (!form.emailId.trim()) return "이메일을 입력하세요.";
    if (form.emailId.length > 30) return "이메일 아이디는 30자 이하로 입력하세요.";
    if (form.emailDomain === "custom" && !form.customDomain.trim()) return "이메일 도메인을 입력하세요.";
    const email = form.emailDomain === 'custom'
        ? `${form.emailId}@${form.customDomain}`
        : `${form.emailId}@${form.emailDomain}`;
    if (email.length > 50) return "이메일은 50자 이하로 입력하세요.";
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) return "유효한 이메일 주소를 입력하세요.";
    return null;
}

function validate(form) {
    return (
        validateUserId(form.userId) ||
        validateNickname(form.nickname) ||
        validatePassword(form.password, form.userId) ||
        validatePasswordCheck(form.password, form.passwordCheck) ||
        validateEmail(form)
    );
}

export default function SignupPage() {
    const [codeSent, setCodeSent] = useState(false);
    const navigate = useNavigate();
    const [isUserIdChecked, setIsUserIdChecked] = useState(false);
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [form, setForm] = useState({
        userId: '',
        nickname: '',
        password: '',
        passwordCheck: '',
        emailId: '',
        emailDomain: 'naver.com',
        customDomain: '',
        duplicateCode: '',
    });
    const [error, setError] = useState(null);

    const isPasswordMatch = form.password && form.passwordCheck && form.password === form.passwordCheck;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // 필드 값 바뀌면 체크/인증상태 무효화
        if (name === 'userId') setIsUserIdChecked(false);
        if (name === 'nickname') setIsNicknameChecked(false);
        if (['emailId', 'emailDomain', 'customDomain'].includes(name)) {
            setIsEmailVerified(false);
            setCodeSent(false);
        }

        // 유효성 검사
        const nextForm = { ...form, [name]: value };
        setError(validate(nextForm));
    };

    const handleDomainChange = (e) => {
        setForm({ ...form, emailDomain: e.target.value, customDomain: '' });
    };

    const sendVerificationCode = async () => {
        const email =
            form.emailDomain === 'custom'
                ? `${form.emailId}@${form.customDomain}`
                : `${form.emailId}@${form.emailDomain}`;

        try {
            await sendVerificationCodeApi(email);
            setCodeSent(true);
            alert('인증번호가 발송되었습니다!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleVerifyEmailCode = async () => {
        await verifyEmailCode(form, setIsEmailVerified);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isUserIdChecked) return alert("아이디 중복 확인을 해주세요.");
        if (!isNicknameChecked) return alert("닉네임 중복 확인을 해주세요.");
        if (!isEmailVerified) return alert("이메일 인증을 완료해주세요.");

        const email = form.emailDomain === 'custom'
            ? `${form.emailId}@${form.customDomain}`
            : `${form.emailId}@${form.emailDomain}`;

        try {
            await signup({ ...form, email });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || '회원가입 실패');
        }
    };

    return (
        <div className="auth-container">
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="inline-field">
                    <label htmlFor="userId">아이디</label>
                    <div className="inline-wrapper">
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={form.userId}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="duplicate-button"
                            onClick={() => checkUserIdDuplicate(form.userId, setIsUserIdChecked)}
                        >
                            중복확인
                        </button>
                    </div>
                </div>
                <div className="inline-field">
                    <label htmlFor="nickname">닉네임</label>
                    <div className="inline-wrapper">
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={form.nickname}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="duplicate-button"
                            onClick={() => checkNicknameDuplicate(form.nickname, setIsNicknameChecked)}
                        >
                            중복확인
                        </button>
                    </div>
                </div>
                <label>
                    비밀번호{" "}
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    비밀번호 확인{" "}
                    <input
                        type="password"
                        name="passwordCheck"
                        value={form.passwordCheck}
                        onChange={handleChange}
                        required
                    />
                </label>
                {form.passwordCheck && !isPasswordMatch && (
                    <div style={{ color: '#e53e3e', fontSize: '0.97rem', marginTop: 4 }}>
                        비밀번호가 일치하지 않습니다.
                    </div>
                )}
                <label>
                    이메일{" "}
                    <div className="email-group">
                        <input
                            type="text"
                            name="emailId"
                            placeholder="이메일"
                            value={form.emailId}
                            onChange={handleChange}
                            required
                            className="email-id"
                        />
                        <span className="email-at">@</span>
                        {form.emailDomain === 'custom' ? (
                            <input
                                type="text"
                                name="customDomain"
                                placeholder="직접입력"
                                value={form.customDomain}
                                onChange={handleChange}
                                required
                                className="email-domain"
                            />
                        ) : (
                            <input
                                type="text"
                                value={form.emailDomain}
                                disabled
                                className="email-domain"
                            />
                        )}
                        <select
                            name="emailDomain"
                            value={form.emailDomain}
                            onChange={handleDomainChange}
                            className="email-select"
                        >
                            <option value="naver.com">naver.com</option>
                            <option value="gmail.com">gmail.com</option>
                            <option value="custom">직접입력</option>
                        </select>
                    </div>
                </label>
                <div className="inline-field">
                    <label htmlFor="duplicateCode">인증번호</label>
                    <div className="inline-duplicate-wrapper">
                        <input
                            type="text"
                            name="duplicateCode"
                            id="duplicateCode"
                            value={form.duplicateCode || ''}
                            onChange={handleChange}
                            required
                            disabled={!codeSent || isEmailVerified}
                        />
                        {!codeSent ? (
                            <button
                                type="button"
                                className="duplicate-send-button"
                                onClick={sendVerificationCode}
                                disabled={isEmailVerified}
                            >
                                번호 발송
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="duplicate-check-button"
                                onClick={handleVerifyEmailCode}
                                disabled={isEmailVerified}
                            >
                                인증 확인
                            </button>
                        )}
                    </div>
                    {isEmailVerified && (
                        <div style={{ color: '#22c55e', fontSize: '0.98rem', marginTop: 4 }}>
                            인증 성공!
                        </div>
                    )}
                    {codeSent && !isEmailVerified && form.duplicateCode && (
                        <div style={{ color: '#e53e3e', fontSize: '0.97rem', marginTop: 4 }}>
                            인증번호가 올바르지 않거나 만료되었습니다.
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="signup-btn"
                    style={{ marginTop: "1.2rem" }}
                    disabled={
                        !isUserIdChecked ||
                        !isNicknameChecked ||
                        !isEmailVerified ||
                        !isPasswordMatch
                    }
                >
                    회원가입
                </button>
            </form>
            <button 
                onClick={() => navigate('/login')}
                style={{
                    display: "block",
                    margin: "2rem auto 0 auto",
                    padding: "0.7rem 0",
                    width: "100%",
                    background: "#f0f0f0",
                    borderRadius: "7px",
                    border: "none",
                    fontWeight: 500,
                    color: "#008ecc",
                    fontSize: "1.01rem",
                    cursor: "pointer",
                    letterSpacing: "0.02em"
                }}
            >
                로그인으로 돌아가기
            </button>
        </div>
    );
}
