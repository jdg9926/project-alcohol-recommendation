import { useState } from "react";
import { sendMessage } from "../../api/messages";

export default function SendMessagePage() {
    const [form, setForm] = useState({ receiverUserId: "", title: "", content: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendMessage(form);
            alert("쪽지를 보냈습니다.");
            setForm({ receiverUserId: "", title: "", content: "" });
        } catch (err) {
            alert("쪽지 전송 실패");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="receiverUserId"
                placeholder="받는 사람 아이디"
                value={form.receiverUserId}
                onChange={handleChange}
            />
            <input
                name="title"
                placeholder="제목"
                value={form.title}
                onChange={handleChange}
            />
            <textarea
                name="content"
                placeholder="내용"
                value={form.content}
                onChange={handleChange}
            ></textarea>
            <button type="submit">보내기</button>
        </form>
    );
}
