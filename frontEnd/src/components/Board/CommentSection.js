import { useState, useEffect, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";
import "./CommentSection.css";

// 날짜 포맷 유틸
const formatDateTime = (dateString) =>
    dateString ? dateString.substring(0, 16).replace("T", " ") : "";

// 댓글 한 줄
function CommentItem({ c, boardId, onDelete, canDelete }) {
    return (
        <li className="comment-item">
            <div className="comment-meta">
                <span className="comment-author">{c.author}</span>
                <span className="comment-date">{formatDateTime(c.createdAt)}</span>
            </div>
            <div className="comment-content">{c.content}</div>
            {canDelete && (
                <button className="comment-del-btn" onClick={() => onDelete(c.id)}>삭제</button>
            )}
        </li>
    );
}

// === ✅ PropTypes 추가 ===
CommentItem.propTypes = {
    c: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        author: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired
    }).isRequired,
    boardId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onDelete: PropTypes.func.isRequired,
    canDelete: PropTypes.bool
};

// 댓글 전체 영역
export default function CommentSection({ boardId }) {
    const { user, loginToken } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    // 댓글 목록 가져오기
    const fetchComments = useCallback(() => {
        setLoading(true);
        fetch(`${BASE_URL}:8888/api/board/${boardId}/comments`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(setComments)
            .catch(() => setComments([]))
            .finally(() => setLoading(false));
    }, [boardId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    // 등록
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("댓글 작성은 로그인 후 가능합니다.");
            return;
        }
        if (!input?.trim()) return;

        const res = await fetch(`${BASE_URL}:8888/api/board/${boardId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": loginToken ? `Bearer ${loginToken}` : undefined
            },
            body: JSON.stringify({ content: input, author: user?.nickname }),
        });
        if (res.ok) {
            setInput("");
            fetchComments();
        } else if (res.status === 401) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
            window.location.href = "/login";
        } else {
            alert("댓글 등록에 실패했습니다.");
        }
    };

    // 삭제
    const handleDelete = async (commentId) => {
        if (!user) {
            alert("댓글 삭제는 로그인 후 가능합니다.");
            return;
        }
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        const res = await fetch(`${BASE_URL}:8888/api/board/${boardId}/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": loginToken ? `Bearer ${loginToken}` : undefined
            }
        });
        if (res.ok) {
            fetchComments();
        } else if (res.status === 401) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
            window.location.href = "/login";
        } else {
            alert("댓글 삭제에 실패했습니다.");
        }
    };

    return (
        <div className="comment-section">
            <div className="comment-title">
                댓글 <span className="comment-count">{comments.length}</span>
            </div>
            {loading ? (
                <div style={{ padding: "16px" }}>댓글 불러오는 중...</div>
            ) : (
                <ul className="comment-list">
                    {comments.length === 0 ? (
                        <li className="comment-empty">등록된 댓글이 없습니다.</li>
                    ) : (
                        comments.map(c => (
                            <CommentItem
                                key={c.id}
                                c={c}
                                boardId={boardId}
                                onDelete={handleDelete}
                                canDelete={user && user.nickname === c.author}
                            />
                        ))
                    )}
                </ul>
            )}
            {/* 로그인 한 사용자만 댓글 작성 폼 노출 */}
            {user ? (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="comment-input"
                        placeholder="댓글을 입력하세요"
                        required
                    />
                    <button type="submit" className="comment-btn">등록</button>
                </form>
            ) : (
                <div className="comment-login-msg" style={{ color: "gray", marginTop: 8 }}>
                    댓글 작성은 <b>로그인 후</b> 가능합니다.
                </div>
            )}
        </div>
    );
}

// === ✅ CommentSection도 propTypes 명시 ===
CommentSection.propTypes = {
    boardId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};
