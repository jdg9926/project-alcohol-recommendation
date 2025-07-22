// src/components/board/BoardDetail.js
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";

import { FiUser, FiCalendar, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import DOMPurify from "dompurify";
import { BASE_URL } from "../../api/baseUrl";
import CommentSection from "./CommentSection";
import "./Board.css";

const formatDateTime = (dateString) =>
    dateString ? dateString.substring(0, 16).replace("T", " ") : "";

export default function BoardDetail() {
    const { user } = useContext(AuthContext); // 유저 정보
    
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [scrapCount, setScrapCount] = useState(0);
    const [scrapped, setScrapped] = useState(false);

    // 비로그인 보호용 핸들러
    const requireLogin = (action) => () => {
        if (!user) {
            alert("로그인이 필요합니다!");
            navigate("/login");
        } else {
            action();
        }
    };
        
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BASE_URL}:8888/api/board/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");
                const data = await res.json();
                console.log("data :::", data);
                setPost(data);
                setLikeCount(data.likeCount ?? 0);
                setScrapCount(data.scrapCount ?? 0);
                setLiked(data.liked ?? false);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // 수정/삭제/좋아요/스크랩 핸들러에 적용
    const handleDelete = requireLogin(async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${BASE_URL}:8888/api/board/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!res.ok) throw new Error("삭제 실패");
            alert("삭제되었습니다.");
            navigate("/board");
        } catch (err) {
            alert(err.message || "삭제에 실패했습니다.");
        }
    });

    const handleLike = requireLogin(async () => {
        const res = await fetch(`${BASE_URL}:8888/api/board/${id}/like`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            console.log("data :::", data);
            setLikeCount(data.likeCount);
            setLiked(data.liked);
        } else {
            alert("좋아요 처리 실패");
        }
    });

    const handleScrap = requireLogin(async () => {
        const res = await fetch(`${BASE_URL}:8888/api/board/${id}/scrap`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            setScrapCount(data.scrapCount);
            setScrapped(true);
        } else {
            alert("스크랩 처리 실패");
        }
    });

    if (loading) {
        return <div className="board-detail-card"><div className="board-detail-loading">불러오는 중...</div></div>;
    }
    if (error || !post) {
        return (
            <div className="board-detail-card">
                <h2>게시글 상세보기</h2>
                <div className="board-detail-error">{error || "해당 게시글을 찾을 수 없습니다."}</div>
                <button type="button" onClick={() => navigate(-1)} className="board-write-btn board-back-btn">
                    <FiArrowLeft className="icon" /> 목록으로
                </button>
            </div>
        );
    }
    
    const hasFiles = post.fileNames && post.fileNames.length > 0;
    const isAuthor = user && user.nickname === post.author; // 본인 확인

    return (
        <div className="board-detail-card">
            <h2>{post.title}</h2>
            <div className="board-meta">
                <span><FiUser className="icon" />{post.author}</span>
                <span><FiCalendar className="icon" />{formatDateTime(post.createdAt)}</span>
            </div>

            <div className="board-like-scrap-bar">
                <button className={`like-btn ${liked ? "on" : ""}`} onClick={handleLike}>
                    ♥ <span>{likeCount}</span>
                </button>
                <button className={`scrap-btn ${scrapped ? "on" : ""}`} onClick={handleScrap}>
                    📌 <span>{scrapCount}</span>
                </button>
            </div>

            <div
                className="board-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {hasFiles && (
                <div className="board-attachments">
                    <b>첨부파일:</b>
                    <ul className="attachment-list">
                        {post.fileNames.map((saveName, i) => (
                            <li key={i}>
                                <a
                                    href={`${BASE_URL}:8888/api/board/download/${encodeURIComponent(saveName)}?originName=${encodeURIComponent(post.originFileNames?.[i] || saveName)}`}
                                    download
                                    className="attachment-link"
                                >
                                    {post.originFileNames?.[i] || saveName}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="board-actions">
                {/* 로그인한 사람만 수정/삭제 버튼 보이기 */}
                {isAuthor && (
                    <>
                        <button className="board-write-btn board-edit-btn" onClick={() => navigate(`/board/${id}/edit`)}>
                            <FiEdit2 className="icon" /> 수정
                        </button>
                        <button className="board-write-btn board-delete-btn" onClick={handleDelete}>
                            <FiTrash2 className="icon" /> 삭제
                        </button>
                    </>
                )}
                <button className="board-write-btn board-back-btn" onClick={() => navigate("/board")}>
                    <FiArrowLeft className="icon" /> 목록으로
                </button>
            </div>

            <CommentSection boardId={id} />
        </div>
    );
}
