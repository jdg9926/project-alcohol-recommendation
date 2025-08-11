import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import "./MessageSendPage.css";

export default function MessageSendPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [to, setTo] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    // 답장 모드: 쿼리 파라미터에서 받는 사람 자동 세팅
    useEffect(() => {
        const prefillTo = searchParams.get("to");
        if (prefillTo) setTo(prefillTo);
    }, [searchParams]);

    const handleSend = async () => {
        if (!to.trim() || !title.trim() || !content.trim()) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            await api("/api/messages/send", {
                method: "POST",
                body: { to, title, content }
            });
            alert("쪽지를 보냈습니다.");
            navigate("/messages");
        } catch (err) {
            console.error("쪽지 전송 실패:", err);
            alert(err.message || "쪽지 전송 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="message-send-container">
            <h2>쪽지 보내기</h2>
            <div className="form-group">
                <label>받는 사람</label>
                <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="닉네임 입력"
                />
            </div>
            <div className="form-group">
                <label>제목</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목 입력"
                />
            </div>
            <div className="form-group">
                <label>내용</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용 입력"
                />
            </div>
            <div className="form-actions">
                <button onClick={() => navigate("/messages")}>취소</button>
                <button onClick={handleSend} disabled={loading}>
                    {loading ? "전송 중..." : "보내기"}
                </button>
            </div>
        </div>
    );
}
