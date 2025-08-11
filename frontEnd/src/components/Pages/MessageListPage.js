import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "./MessageListPage.css";

export default function MessageListPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("inbox"); // inbox | sent
    const navigate = useNavigate();

    
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const data = await api(`/api/messages?box=${tab}`);
                setMessages(data || []);
            } catch (err) {
                console.error("쪽지 목록 불러오기 실패:", err);
                alert(err.message || "쪽지 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [tab]);

    return (
        <div className="message-list-container">
            <h2>쪽지함</h2>

            {/* 탭 버튼 */}
            <div className="message-tabs">
                <button
                    className={tab === "inbox" ? "active" : ""}
                    onClick={() => setTab("inbox")}
                >
                    받은 쪽지함
                </button>
                <button
                    className={tab === "sent" ? "active" : ""}
                    onClick={() => setTab("sent")}
                >
                    보낸 쪽지함
                </button>
                <button
                    className="send-button"
                    onClick={() => navigate("/messages/send")}
                >
                    새 쪽지
                </button>
            </div>

            {loading ? (
                <p>불러오는 중...</p>
            ) : messages.length === 0 ? (
                <p>쪽지가 없습니다.</p>
            ) : (
                <table className="message-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>{tab === "inbox" ? "보낸 사람" : "받는 사람"}</th>
                            <th>제목</th>
                            <th>날짜</th>
                            <th>읽음</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map((msg) => (
                            <tr
                                key={msg.id}
                                className={!msg.read && tab === "inbox" ? "unread" : ""}
                                onClick={() => navigate(`/messages/${msg.id}`)}
                            >
                                <td>{msg.id}</td>
                                <td>{tab === "inbox" ? msg.senderNickname : msg.receiverNickname}</td>
                                <td>{msg.title}</td>
                                <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                <td>{msg.read ? "O" : "X"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
