import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Board.css";

export default function BoardEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(true);

    // 기존 내용 불러오기
    useEffect(() => {
        fetch(`http://localhost:8888/api/board/${id}`)
            .then(res => res.json())
            .then(data => setForm({ title: data.title, content: data.content }))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8888/api/board/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("수정 실패");
            alert("수정되었습니다!");
            navigate(`/board/${id}`);
        } catch (err) {
            alert(err.message || "수정에 실패했습니다.");
        }
    };

    if (loading) return <div className="board-detail-loading">불러오는 중...</div>;

    return (
        <div className="board-write-form">
            <h2>게시글 수정</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className="board-input"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="제목"
                />
                <textarea
                    className="board-textarea"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                    rows={10}
                />
                <div className="board-write-btns">
                    <button type="submit" className="board-write-btn">저장</button>
                    <button type="button" className="board-write-btn board-write-cancel" onClick={() => navigate(-1)}>취소</button>
                </div>
            </form>
        </div>
    );
}
