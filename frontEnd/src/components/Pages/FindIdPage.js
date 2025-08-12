import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BASE_URL } from '../../api/baseUrl';

export default function FindIdPage() {
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); 
        setResult(null);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/find-userId`, {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({ 
                    email 
                })
            });
            const body = await res.json();
            console.log("body ::", body);
            if (!res.ok) throw new Error(body.message);
            setResult(body.userId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    등록된 이메일{" "}
                    <input
                        type="email"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        required 
                    />
                </label>
                <button type="submit">아이디 찾기</button>
            </form>
            { result && 
                <p style={{ 
                    marginTop: "1.5rem",
                    background: "#f6fbff",
                    color: "#1388d8",
                    borderRadius: "8px",
                    padding: "0.7rem",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1.07rem"
                }}>
                    고객님의 아이디는 : <strong>{result}</strong>
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
