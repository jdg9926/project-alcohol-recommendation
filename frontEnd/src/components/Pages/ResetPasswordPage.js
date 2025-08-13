// src/components/Pages/ResetPasswordPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../api/auth";
import "./Auth.css";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        code: "",
        password: "",
        passwordCheck: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.email.trim()) return "이메일을 입력해주세요.";
        if (!form.code.trim()) return "인증번호를 입력해주세요.";
        if (form.password.length < 8) return "비밀번호는 8자리 이상이어야 합니다.";
        if (form.password !== form.passwordCheck) return "비밀번호가 일치하지 않습니다.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            await resetPasswordApi({
                email: form.email,
                code: form.code,
                newPassword: form.password
            });
            alert("비밀번호가 성공적으로 변경되었습니다!");
            navigate("/login");
        } catch (err) {
            setError(err.message || "비밀번호 재설정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 재설정</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    이메일
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="이메일 입력"
                        required
                    />
                </label>
                <label>
                    인증번호
                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="인증번호 입력"
                        required
                    />
                </label>
                <label>
                    새 비밀번호
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="새 비밀번호 입력"
                        required
                    />
                </label>
                <label>
                    새 비밀번호 확인
                    <input
                        type="password"
                        name="passwordCheck"
                        value={form.passwordCheck}
                        onChange={handleChange}
                        placeholder="비밀번호 확인"
                        required
                    />
                </label>
                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? "처리 중..." : "비밀번호 변경"}
                </button>
            </form>

            <button
                onClick={() => navigate("/login")}
                className="auth-back-btn"
            >
                로그인으로 돌아가기
            </button>
        </div>
    );
}
