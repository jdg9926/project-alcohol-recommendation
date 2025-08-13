import { useEffect, useState } from "react";
import { getInbox } from "../../api/messages";
import { Link } from "react-router-dom";

export default function InboxPage() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        getInbox().then(setMessages).catch(console.error);
    }, []);

    return (
        <div>
            <h2>받은 쪽지함</h2>
            <ul>
                {messages.map((msg) => (
                    <li key={msg.id}>
                        <Link to={`/messages/${msg.id}`}>
                            {msg.title} - {msg.otherUser} ({msg.readFlag ? "읽음" : "안읽음"})
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
