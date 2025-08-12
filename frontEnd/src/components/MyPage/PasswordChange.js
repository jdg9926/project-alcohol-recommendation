// src/components/MyPage/PasswordChange.js
import { useState, useContext } from "react";
import { resetPasswordApi } from "../../api/auth";
import PasswordStrengthBar from "../Common/PasswordStrengthBar";
import { AuthContext } from "../../AuthContext"; // ★ 추가

export default function PasswordChange() {
    const { user } = useContext(AuthContext); // ★ 추가
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
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
        if (form.currentPassword === form.newPassword)
            return "현재 비밀번호와 다른 비밀번호를 사용하세요.";
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
                newPassword: form.newPassword
            });
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setError(err?.data?.message || "비밀번호 변경 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mypage-card">
            <h3>비밀번호 변경</h3>
            <form onSubmit={handleSubmit} className="form-vertical" autoComplete="on">
                {/* ★ 자동완성/비번관리자용 숨김 username 필드 */}
                <label className="visually-hidden" htmlFor="pc-username">아이디</label>
                <input
                    id="pc-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={user?.email || user?.userId || ""}
                    readOnly
					hidden
                    tabIndex={-1}
                    className="visually-hidden"
                    aria-hidden="true"
                />

                <label>
                    현재 비밀번호
                    <div className="input-with-btn">
                        <input
                            type={show.current ? "text" : "password"}
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                        <button type="button" className="btn ghost" onClick={() => setShow((s) => ({ ...s, current: !s.current }))}>
                            {show.current ? "숨기기" : "표시"}
                        </button>
                    </div>
                </label>

                <label>
                    새 비밀번호
                    <div className="input-with-btn">
                        <input
                            type={show.next ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                        <button type="button" className="btn ghost" onClick={() => setShow((s) => ({ ...s, next: !s.next }))}>
                            {show.next ? "숨기기" : "표시"}
                        </button>
                    </div>
                </label>
                <PasswordStrengthBar password={form.newPassword} />

                <label>
                    새 비밀번호 확인
                    <div className="input-with-btn">
                        <input
                            type={show.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                        <button type="button" className="btn ghost" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}>
                            {show.confirm ? "숨기기" : "표시"}
                        </button>
                    </div>
                </label>

                {error && <p className="form-error" id="pc-error" aria-live="polite">{error}</p>}
                {message && <p className="form-success" aria-live="polite">{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
            </form>
        </div>
    );
}
