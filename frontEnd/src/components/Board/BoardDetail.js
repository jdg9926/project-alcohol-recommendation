import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiUser, FiCalendar, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import DOMPurify from 'dompurify';

import "./Board.css";

export default function BoardDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8888/api/board/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");
                return res.json();
            })
            .then(data => setPost(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`http://localhost:8888/api/board/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("삭제 실패");
            alert("삭제되었습니다.");
            navigate("/board"); // 목록으로 이동
        } catch (err) {
            alert(err.message || "삭제에 실패했습니다.");
        }
    };

    function formatDateTime(dateString) {
        if (!dateString) return "";
        return dateString.substring(0, 16).replace("T", " ");
    }

    if (loading) {
        return (
            <div className="board-detail-card">
                <div className="board-detail-loading">
                    불러오는 중...
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="board-detail-card">
                <h2>게시글 상세보기</h2>
                <div className="board-detail-error">
                    {error || "해당 게시글을 찾을 수 없습니다."}
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="board-write-btn board-back-btn"
                >
                    <FiArrowLeft className="icon" /> 목록으로
                </button>
            </div>
        );
    }

    return (
        <div className="board-detail-card">
            <h2>{post.title}</h2>
            <div className="board-meta">
                <span><FiUser className="icon" />{post.author}</span>
                <span><FiCalendar className="icon" />{formatDateTime(post.createdAt)}</span>
            </div>
            <div
                className="board-content"
                dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(post.content)}}
            />
            <div className="board-actions">
                <button className="board-write-btn board-edit-btn" onClick={() => navigate(`/board/${id}/edit`)}>
                    <FiEdit2 className="icon" /> 수정
                </button>
                <button className="board-write-btn board-delete-btn" onClick={handleDelete}>
                    <FiTrash2 className="icon" /> 삭제
                </button>
                <button
                    className="board-write-btn board-back-btn"
                    onClick={() => navigate("/board")}
                >
                    <FiArrowLeft className="icon" /> 목록으로
                </button>
            </div>
        </div>
    );
}
