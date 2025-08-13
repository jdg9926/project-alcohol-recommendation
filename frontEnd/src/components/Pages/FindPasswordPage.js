// src/components/Pages/FindPasswordPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerificationCodeApi, verifyEmailCode } from "./SignupActive";

export default function FindPasswordPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        emailId: "",
        emailDomain: "naver.com",
        customDomain: "",
        code: "",
    });
    const [codeSent, setCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (["emailId", "emailDomain", "customDomain"].includes(name)) {
            setIsEmailVerified(false);
            setCodeSent(false);
        }
    };

    const handleDomainChange = (e) => {
        setForm({ ...form, emailDomain: e.target.value, customDomain: "" });
    };

    const sendVerificationCode = async () => {
        const email =
            form.emailDomain === "custom"
                ? `${form.emailId}@${form.customDomain}`
                : `${form.emailId}@${form.emailDomain}`;

        try {
            await sendVerificationCodeApi(email, "passwordReset");
            setCodeSent(true);
            alert("인증번호가 발송되었습니다!");
        } catch (err) {
            setError(err.message || "인증번호 발송 실패");
        }
    };

    const handleVerifyEmailCode = async () => {
        const email =
            form.emailDomain === "custom"
                ? `${form.emailId}@${form.customDomain}`
                : `${form.emailId}@${form.emailDomain}`;
        try {
            await verifyEmailCode({ email, code: form.code }, setIsEmailVerified);
        } catch (err) {
            setError(err.message || "인증 실패");
        }
    };

    const handleNext = () => {
        const email =
            form.emailDomain === "custom"
                ? `${form.emailId}@${form.customDomain}`
                : `${form.emailId}@${form.emailDomain}`;
        navigate("/reset-password", { state: { email } });
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 찾기</h2>
            {error && <p className="error">{error}</p>}

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
                    {form.emailDomain === "custom" ? (
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
                <label htmlFor="code">인증번호</label>
                <div className="inline-duplicate-wrapper">
                    <input
                        type="text"
                        name="code"
                        id="code"
                        value={form.code}
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
                    <div style={{ color: "#22c55e", fontSize: "0.98rem", marginTop: 4 }}>
                        인증 성공!
                    </div>
                )}
            </div>

            <button
                type="button"
                className="signup-btn"
                style={{ marginTop: "1.2rem" }}
                disabled={!isEmailVerified}
                onClick={handleNext}
            >
                다음
            </button>
        </div>
    );
}
