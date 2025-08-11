// src/components/MyPage/PasswordChange.js
import { useState } from "react";
import { resetPasswordApi } from "../../api/auth";
import PasswordStrengthBar from "../Common/PasswordStrengthBar";

export default function PasswordChange() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setMessage(null);
    };

    const validateForm = () => {
        if (!form.currentPassword) return "현재 비밀번호를 입력하세요.";
        if (!form.newPassword) return "새 비밀번호를 입력하세요.";
        if (form.newPassword.length < 8) return "비밀번호는 8자리 이상이어야 합니다.";
        if (!/[~!@#$%^&*()_\-+={};':"\\|,.<>/?]/.test(form.newPassword))
            return "비밀번호에 특수문자를 포함해야 합니다.";
        if (form.newPassword !== form.confirmPassword)
            return "새 비밀번호와 확인이 일치하지 않습니다.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            await resetPasswordApi({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            setError(err?.data?.message || "비밀번호 변경 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-change">
            <h3>비밀번호 변경</h3>
            <form onSubmit={handleSubmit}>
                <label>
                    현재 비밀번호
                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    새 비밀번호
                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        required
                    />
                </label>
                <PasswordStrengthBar password={form.newPassword} />

                <label>
                    새 비밀번호 확인
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </label>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {message && <p style={{ color: "green" }}>{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
            </form>
        </div>
    );
}
