import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import "./MessageDetailPage.css";

export default function MessageDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMessage = async () => {
        setLoading(true);
        try {
            const data = await api(`/api/messages/${id}`, { method: "GET" });
            setMessage(data);
        } catch (err) {
            console.error("쪽지 불러오기 실패:", err);
            alert(err.message || "쪽지를 불러올 수 없습니다.");
            navigate("/messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("이 쪽지를 삭제하시겠습니까?")) return;
        try {
            await api(`/api/messages/${id}`, { method: "DELETE" });
            alert("쪽지가 삭제되었습니다.");
            navigate("/messages");
        } catch (err) {
            console.error("쪽지 삭제 실패:", err);
            alert(err.message || "쪽지를 삭제할 수 없습니다.");
        }
    };

    const handleReply = () => {
        navigate("/messages/send", {
            state: {
                receiverNickname: message.senderNickname,
                title: `RE: ${message.title}`,
            },
        });
    };

    useEffect(() => {
        fetchMessage();
    }, [id]);

    if (loading) return <p>불러오는 중...</p>;
    if (!message) return null;

    return (
        <div className="message-detail-container">
            <h2>쪽지 상세</h2>
            <div className="message-detail-info">
                <p><strong>보낸 사람:</strong> {message.senderNickname}</p>
                <p><strong>받는 사람:</strong> {message.receiverNickname}</p>
                <p><strong>날짜:</strong> {new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <hr />
            <h3>{message.title}</h3>
            <p className="message-content">{message.content}</p>
            <div className="message-buttons">
                <button onClick={() => navigate("/messages")}>목록</button>
                <button onClick={handleReply}>답장</button>
                <button onClick={handleDelete} className="delete-btn">삭제</button>
            </div>
        </div>
    );
}
