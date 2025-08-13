import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../../api/client";
import "./MessageSendPage.css";

export default function MessageSendPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    // 기본값
    const [to, setTo] = useState("admin");
    const [title, setTitle] = useState("테스트");
    const [content, setContent] = useState("테스트");
    const [loading, setLoading] = useState(false);

    // 답장 모드 or URL 파라미터 → 받는 사람/제목 채우기
    useEffect(() => {
        const prefillToFromQuery = searchParams.get("to");

        if (location.state?.receiverUserId) {
            setTo(location.state.receiverUserId);
        } else if (prefillToFromQuery) {
            setTo(prefillToFromQuery);
        }

        if (location.state?.title) {
            setTitle(location.state.title);
        }
    }, [searchParams, location.state]);

    const handleSend = async () => {
        if (!to.trim() || !title.trim() || !content.trim()) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const body = {
            receiverUserId: to.trim(),
            title: title.trim(),
            content: content.trim(),
        };

        setLoading(true);
        try {
            await api("/api/messages/send", {
                method: "POST",
                body
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
