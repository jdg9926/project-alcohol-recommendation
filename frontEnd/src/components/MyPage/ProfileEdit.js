import { useState } from "react";

export default function ProfileEdit({ user }) {
    const [nickname, setNickname] = useState(user.nickname);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 서버에 PATCH/PUT 요청 (headers에 Authorization 포함!)
        try {
            // 예시: PATCH /api/users/me
            const res = await fetch("/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ nickname }),
            });
            if (res.ok) setMessage("수정되었습니다!");
            else setMessage("수정 실패");
        } catch {
            setMessage("수정 오류");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>닉네임: <input value={nickname} onChange={e => setNickname(e.target.value)} /></div>
            <button type="submit">수정</button>
            {message && <div>{message}</div>}
        </form>
    );
}
