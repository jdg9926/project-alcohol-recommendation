import { useState } from "react";
import { api } from "../../api/client";

export default function MessageCompose() {
    const [toNickname, setToNickname] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!toNickname || !content) {
            alert("닉네임과 내용을 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            await api("/api/messages", {
                method: "POST",
                body: { toNickname, content },
            });
            alert("쪽지를 보냈습니다.");
            setToNickname("");
            setContent("");
        } catch (err) {
            alert(err.message || "쪽지 전송 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>쪽지 보내기</h3>
            <input
                type="text"
                placeholder="받는 사람 닉네임"
                value={toNickname}
                onChange={(e) => setToNickname(e.target.value)}
            />
            <textarea
                placeholder="내용 입력"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handleSend} disabled={loading}>
                {loading ? "전송 중..." : "보내기"}
            </button>
        </div>
    );
}
