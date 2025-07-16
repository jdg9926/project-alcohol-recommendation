import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// const API_BASE_URL = "http://localhost:8888";
const API_BASE_URL = "http://192.168.3.24:8888";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordCheck, setNewPasswordCheck] = useState('');
    
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setInfo('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || '비밀번호 재설정 실패');
            setInfo('비밀번호가 성공적으로 변경되었습니다. \n 3초 후 로그인 페이지로 이동됩니다.');
            // 3초 뒤 로그인 페이지로 이동
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>비밀번호 재설정</h2>
            {error && <p className="error">{error}</p>}
            {info && <p className="info">{info}</p>}
            {!info && (
                <form onSubmit={handleSubmit} className="auth-form">
                    <label>
                        새 비밀번호
                        <input
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required minLength={6}
                        />
                    </label>
                    <label>
                        새 비밀번호 확인
                        <input
                        type="password"
                        name="newPasswordCheck"
                        value={newPasswordCheck}
                        onChange={e => setNewPasswordCheck(e.target.value)}
                        required minLength={6}
                        />
                    </label>
                    <button type="submit">비밀번호 변경</button>
                </form>
            )}
        </div>
    );
}
