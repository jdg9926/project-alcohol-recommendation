import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { AuthContext } from '../../AuthContext';

import './Auth.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ userId: '', password: '' });
    const [error, setError] = useState(null);
    const { setUser, setLoginToken } = useContext(AuthContext);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        console.log("Form submitted:", form); // 디버깅용 로그
        e.preventDefault();
        try {
            const body = await login(form);
            setLoginToken(body.token);
            setUser(body.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
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
                <div style={{fontSize: "12px", color: "#0077b6", textAlign: "center" }}>
                    <Link to="/find-id" style={{ color: "#0077b6", textDecoration: "underline", fontWeight: 500 }}>
                        아이디 찾기
                    </Link>
                    <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
                    <Link to="/find-password" style={{ color: "#0077b6", textDecoration: "underline", fontWeight: 500 }}>
                        비밀번호 찾기
                    </Link>
                    <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
                    <Link to="/signup" style={{ color: "#666", textDecoration: "underline"}}>
                        회원가입
                    </Link>
                </div>
            </form>
        </div>
    );
}
