import { useState } from "react";

export default function PasswordChange({ user }) {
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
            });
            if (res.ok) setMessage("변경 완료!");
            else setMessage("변경 실패");
        } catch {
            setMessage("변경 오류");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>현재 비밀번호: <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} /></div>
            <div>새 비밀번호: <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
            <button type="submit">변경</button>
            {message && <div>{message}</div>}
        </form>
    );
}
