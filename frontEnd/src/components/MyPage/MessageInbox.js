import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function MessageInbox() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await api("/api/messages/inbox");
            setMessages(data);
        } catch (err) {
            alert(err.message || "쪽지 불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        try {
            await api(`/api/messages/${id}/read`, { method: "PATCH" });
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, read: true } : m))
            );
        } catch (err) {
            alert(err.message || "읽음 처리 실패");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("이 쪽지를 삭제하시겠습니까?")) return;
        try {
            await api(`/api/messages/${id}`, { method: "DELETE" });
            setMessages((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            alert(err.message || "삭제 실패");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div>
            <h3>받은 쪽지함</h3>
            {messages.length === 0 ? (
                <p>받은 쪽지가 없습니다.</p>
            ) : (
                <ul>
                    {messages.map((msg) => (
                        <li
                            key={msg.id}
                            style={{
                                background: msg.read ? "#f8f8f8" : "#e8f5ff",
                                padding: "8px",
                                marginBottom: "6px",
                                borderRadius: "4px",
                            }}
                        >
                            <strong>{msg.fromNickname}</strong> - {msg.content}
                            <div style={{ marginTop: "4px" }}>
                                {!msg.read && (
                                    <button onClick={() => handleRead(msg.id)}>읽음</button>
                                )}
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    style={{ marginLeft: "6px", color: "red" }}
                                >
                                    삭제
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
