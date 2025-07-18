import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Error from "../Common/Error";

const API_BASE_URL = "http://43.200.182.46:8888";

export default function FindPasswordPage() {
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');

    const [info, setInfo] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); 
        setInfo('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password-request`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({ 
                    userId,
                    email
                })
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message);
            setInfo('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
        } catch (err) {
            setError(err.message);
        } finally {

        }
    };

    
    if (error) return <Error type={error.type} detail={error.detail} />;

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    아이디
                    <input
                        type="userId"
                        value={userId}
                        onChange={e=>setUserId(e.target.value)}
                        required 
                    />
                </label>
                <label>
                    이메일
                    <input
                        type="email"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        required 
                    />
                </label>
                <button type="submit">링크 발송</button>
            </form>
            { info && 
                <p className="info">
                    {info}
                </p> 
            }
            { error && <p className="error">{error}</p> }
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
    );
}
