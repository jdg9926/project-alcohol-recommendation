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

function validate(form) {
    
    // 아이디: 6~16글자, 영문/숫자만(특수문자 불가)
    if (!form.userId.trim()) return "아이디를 입력하세요.";
    if (form.userId.length <= 6 || form.userId.length >= 16) return "아이디는 6~16자여야 합니다.";
    if (!/^[a-zA-Z0-9]+$/.test(form.userId)) return "아이디는 영문과 숫자만 가능합니다.";
    // 🚩 금지 아이디(admin)
    if (form.userId.toLowerCase() === "admin") return "사용할 수 없는 아이디입니다.";

    // 닉네임: 2~16글자, 한글/영문/숫자만(특수문자 불가)
    if (!form.nickname.trim()) return "닉네임을 입력하세요.";
    if (form.nickname.length <= 2 || form.nickname.length >= 16) return "닉네임은 2~16자여야 합니다.";
    if (!/^[가-힣a-zA-Z0-9]+$/.test(form.nickname)) return "닉네임은 한글, 영문, 숫자만 가능합니다.";
    // 🚩 금지 닉네임(관리자)
    if (form.nickname === "관리자") return "사용할 수 없는 닉네임입니다.";

    // 비밀번호: 8자리 이상, 영문/숫자/특수문자 모두 포함, 공백 금지
    if (!form.password) return "비밀번호를 입력하세요.";
    if (form.password.length <= 8) return "비밀번호는 8자리 이상이어야 합니다.";
    if (!/[~!@#$%^&*()_\-+={};':"\\|,.<>/?]/.test(form.password)) {
        return "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
    }
    if (/\s/.test(form.password)) return "비밀번호에 공백은 사용할 수 없습니다.";

    // 아이디-비밀번호 동일 금지
    if (form.userId === form.password) return "아이디와 비밀번호가 같을 수 없습니다.";

    // 비밀번호 확인
    if (form.password !== form.passwordCheck) return "비밀번호가 일치하지 않습니다.";

    // 이메일: 입력 및 길이(최대 50자 제한 예시)
    if (!form.emailId.trim()) return "이메일을 입력하세요.";
    if (form.emailId.length >= 30) return "이메일 아이디는 30자 이하로 입력하세요.";
    if (form.emailDomain === "custom" && !form.customDomain.trim()) return "이메일 도메인을 입력하세요.";
    const email = form.emailDomain === 'custom'
        ? `${form.emailId}@${form.customDomain}`
        : `${form.emailId}@${form.emailDomain}`;
    if (email.length >= 50) return "이메일은 50자 이하로 입력하세요.";
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email)) return "유효한 이메일 주소를 입력하세요.";

    // 통과!
    return null;
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
        customDomain: ''
    });
    const [error, setError] = useState(null);
    const isPasswordMatch = form.password && form.passwordCheck && form.password === form.passwordCheck;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // 1. 유효성 검사 실행!
        const errorMsg = validate(form);
        if (errorMsg) {
            setError(errorMsg);
            return;
        }

        // 필드 값 바뀌면 체크/인증상태 무효화 (이전 인증/중복확인 무효처리)
        if (e.target.name === 'userId') setIsUserIdChecked(false);
        if (e.target.name === 'nickname') setIsNicknameChecked(false);
        if (
            e.target.name === 'emailId' ||
            e.target.name === 'emailDomain' ||
            e.target.name === 'customDomain'
        ) {
            setIsEmailVerified(false);
            setCodeSent(false);
        }
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
            const code = await sendVerificationCodeApi(email);
            console.log(code);
            setCodeSent(true);
            
            alert("인증번호를 전송했습니다.");

        } catch (err) {
            alert("이메일 전송 실패");
        }
    };

    const handleVerifyEmailCode = async () => {
        await verifyEmailCode(form, setIsEmailVerified);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isUserIdChecked) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }

        if (!isNicknameChecked) {
            alert("닉네임 중복 확인을 해주세요.");
            return;
        }

        if (!isEmailVerified) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        const email = form.emailDomain === 'custom'
            ? `${form.emailId}@${form.customDomain}`
            : `${form.emailId}@${form.emailDomain}`;

        try {
            await signup({ ...form, email });
            navigate('/login');
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || '회원가입 실패');
        }
    };

    return (
        <>
            <div className="auth-container">
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className="inline-field">
                        <label>아이디</label>
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
                        <label>닉네임</label>
                        <div className="inline-wrapper">
                            <input
                                type="text"
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
                        비밀번호
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        비밀번호 확인
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
                        이메일
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
                            <select name="emailDomain" value={form.emailDomain} onChange={handleDomainChange} className="email-select">
                                <option value="naver.com">naver.com</option>
                                <option value="gmail.com">gmail.com</option>
                                <option value="custom">직접입력</option>
                            </select>
                        </div>
                    </label>
                    <div className="inline-field">
                        <label>인증번호</label>
                        <div className="inline-duplicate-wrapper">
                            <input
                                type="text"
                                name="duplicateCode"
                                value={form.duplicateCode || ''}
                                onChange={handleChange}
                                required
                                disabled={!codeSent || isEmailVerified} // 인증 성공시 입력 막기
                            />

                            {!codeSent ? (
                                <button
                                    type="button"
                                    className="duplicate-send-button"
                                    onClick={sendVerificationCode}
                                    disabled={isEmailVerified} // 인증됐으면 발송불가
                                >
                                    번호 발송
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="duplicate-check-button"
                                    onClick={handleVerifyEmailCode}
                                    disabled={isEmailVerified} // 인증됐으면 확인불가
                                >
                                    인증 확인
                                </button>
                            )}
                        </div>
                        {/* 인증 결과 안내 */}
                        {isEmailVerified && (
                            <div style={{ color: '#22c55e', fontSize: '0.98rem', marginTop: 4 }}>
                                인증 성공!
                            </div>
                        )}
                        {codeSent && !isEmailVerified && form.duplicateCode && (
                            <div style={{ color: '#e53e3e', fontSize: '0.97rem', marginTop: 4 }}>
                                {/* 서버에서 실패 응답시만 노출, 예시 */}
                                인증번호가 올바르지 않거나 만료되었습니다.
                            </div>
                        )}
                    </div>
                    <div className="auth-form">
                        <button
                            type="submit"
                            className="signup-btn"
                            disabled={
                                !isUserIdChecked ||
                                !isNicknameChecked ||
                                !isEmailVerified ||
                                !isPasswordMatch
                            }
                        >
                            회원가입
                        </button>
                    </div>
                </form>
                <button 
                    onClick={()=>navigate('/login')}
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
        </>
    );
}
