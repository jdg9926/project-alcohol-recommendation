import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { AuthContext } from "../../../AuthContext";
import "./MessageDetailPage.css";

export default function MessageDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUnreadCount } = useContext(AuthContext);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const data = await api(`/api/messages/${id}`, { method: "GET" });

                // 읽음 처리 직후 카운트 감소
                if (!data.readFlag && data.receiverId === user.userId) {
                    setUnreadCount(prev => Math.max(prev - 1, 0));
                }

                if (alive) setMessage(data);
            } catch (err) {
                if (alive) {
                    console.error("쪽지 불러오기 실패:", err);
                    alert(err.message || "쪽지를 불러올 수 없습니다.");
                    navigate("/messages");
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id, navigate, user, setUnreadCount]);

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
        if (!message || !user) return;
        const toUserId = (message.senderId === user.userId) 
            ? message.receiverId 
            : message.senderId;

        navigate("/messages/send", { state: { receiverUserId: toUserId, title: `RE: ${message.title}` } });
    };

    if (loading) return <p>불러오는 중...</p>;
    if (!message) return null;

    return (
        <div className="message-detail-container">
            <h2>쪽지 상세</h2>
            <div className="message-detail-info">
                <p><strong>보낸 사람:</strong> {message.sender}</p>
                <p><strong>받는 사람:</strong> {message.receiver}</p>
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
