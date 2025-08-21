import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { AuthContext } from '../../AuthContext';

import './Auth.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ userId: '', password: '' });
    const [error, setError] = useState(null);
    const { setLoginToken } = useContext(AuthContext);


    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const body = await login(form);
            setLoginToken(body.token, body.user); // 토큰+유저 저장
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    // ✅ 자동 입력 핸들러
    const fillAdmin = () => {
        setForm({ userId: 'admin01', password: '11111111' });
    };
    const fillUser = () => {
        setForm({ userId: 'user01', password: '11111111' });
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    아이디{" "}
                    <input
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                    />
                </label>
                <label>
                    비밀번호{" "}
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">로그인</button>

                {/* ✅ 자동 입력 버튼 */}
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                    <button type="button" onClick={fillAdmin} style={{ background: "#ff6b6b", color: "#fff" }}>
                        관리자 계정
                    </button>
                    <button type="button" onClick={fillUser} style={{ background: "#4dabf7", color: "#fff" }}>
                        일반 계정
                    </button>
                </div>

                <div style={{ fontSize: "12px", color: "#0077b6", textAlign: "center", marginTop: "12px" }}>
                    <Link to="/find-id" style={{ color: "#0077b6", textDecoration: "underline", fontWeight: 500 }}>
                        아이디 찾기
                    </Link>
                    <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
                    <Link to="/find-password" style={{ color: "#0077b6", textDecoration: "underline", fontWeight: 500 }}>
                        비밀번호 찾기
                    </Link>
                    <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
                    <Link to="/signup" style={{ color: "#666", textDecoration: "underline" }}>
                        회원가입
                    </Link>
                </div>
            </form>
        </div>
    );
}
