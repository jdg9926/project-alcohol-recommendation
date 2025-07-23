import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";
import "./Board.css";

const tabs = [
    { label: '전체게시판', type: 'ALL' },
    { label: '일반게시판', type: 'GENERAL' },
    { label: '에러게시판', type: 'ERROR' },
    { label: 'AI 추천게시판', type: 'AI' }
];

export default function BoardList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 페이징 처리
    const [page, setPage] = useState(0);
    const [size] = useState(5); // 한 페이지에 5개
    const [totalPages, setTotalPages] = useState(1);

    // 검색
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    // 정렬
    const [sortOrder, setSortOrder] = useState("desc");

    // 넘버링
    const [totalElements, setTotalElements] = useState(0);

    const { user } = useContext(AuthContext); // 유저 정보
    const isLoggedIn = !!user; // user state에 따라

    const navigate = useNavigate();
    const location = useLocation();
    const getBoardTypeFromUrl = useCallback(() => {
        return new URLSearchParams(location.search).get('boardType') || 'ALL';
    }, [location.search]);
    
    // boardType 상태 추가
    const [boardType, setBoardType] = useState(getBoardTypeFromUrl());
    
    // boardType 상태와 URL 동기화
    useEffect(() => {
        const urlBoardType = getBoardTypeFromUrl();
        if (boardType !== urlBoardType) {
            setBoardType(urlBoardType);
        }
    }, [boardType, getBoardTypeFromUrl]);

    // 탭 클릭시 URL도 같이 변경!
    const handleTabClick = (type) => {
        // setBoardType(type);  // 상태만 바꾸는 대신
        navigate(`?boardType=${type}`); // URL만 바꾸면 useEffect로 상태가 동기화됨
        setPage(0);
    };

    useEffect(() => {
        setLoading(true);
        let url = `${BASE_URL}:8888/api/board/list?page=${page}&size=${size}&sort=createdAt,${sortOrder}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (boardType && boardType !== 'ALL') url += `&boardType=${boardType}`;
        else url += `&boardType=ALL`;
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");
                return res.json();
            })
            .then(data => {
                setPosts(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [page, size, search, sortOrder, boardType]); // boardType 의존성 추가

    return (
        <div className="board-container">
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.type}
                        className={`board-tab-btn${boardType === tab.type ? ' active' : ''}`}
                        onClick={() => {
                            handleTabClick(tab.type)
                            setPage(0); // 탭 전환 시 첫 페이지로 이동
                        }}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: boardType === tab.type ? "2px solid #e03e3e" : "1px solid #eee",
                            background: boardType === tab.type ? "#fff5f5" : "#fff",
                            color: boardType === tab.type ? "#e03e3e" : "#444",
                            fontWeight: boardType === tab.type ? 700 : 400,
                            fontSize: 17,
                            cursor: "pointer"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="board-header">
                <h2 className="board-title">게시판</h2>
                {boardType === "GENERAL" ? (
                    isLoggedIn ? (
                        <Link to={`write?boardType=GENERAL`} className="board-write-btn">글쓰기</Link>
                    ) : (
                        <button
                            className="board-write-btn"
                            onClick={() => alert("로그인 후 글쓰기가 가능합니다!")}
                        >글쓰기</button>
                    )
                ) : null}
            </div>
            <div className="board-sort-bar">
                <label htmlFor="board-sort-select" className="board-sort-label">정렬:</label>
                <select
                    id="board-sort-select"
                    className="board-sort-select"
                    value={sortOrder}
                    onChange={e => {
                        setSortOrder(e.target.value);
                        setPage(0);
                    }}
                >
                    <option value="desc">최신순</option>
                    <option value="asc">오래된순</option>
                </select>
            </div>
            <table className="board-table">
                <thead>
                    <tr>
                        <th style={{width: "7%"}}>No</th>
                        <th className="board-col-title">제목</th>
                        <th className="board-col-author">작성자</th>
                        <th className="board-col-date">작성일</th>
                        <th style={{width:"10%"}}>♥</th>
                        <th style={{width:"10%"}}>💬</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="board-empty-row" colSpan={6}>
                                <span style={{ fontSize: 18, color: "#aaa" }}>불러오는 중...</span>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td className="board-empty-row" colSpan={6}>
                                <span style={{ color: "#e03e3e" }}>{error}</span>
                            </td>
                        </tr>
                    ) : posts.length === 0 ? (
                        <tr>
                            <td className="board-empty-row" colSpan={6}>
                                <span style={{ fontSize: 32, marginRight: 8 }}>📄</span>
                                게시글이 없습니다
                            </td>
                        </tr>
                    ) : (
                        posts.map((post, idx) => (
                            <tr key={post.id}>
                                <td>
                                    {totalElements - (page * size + idx)}
                                </td>
                                <td className="board-title-cell board-col-title">
                                    <Link 
                                        to={`${post.id}?boardType=${boardType}`} 
                                        className="board-link"
                                        >
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="board-col-author">
                                    {post.author}
                                </td>
                                <td className="board-col-date">
                                    {post.createdAt ? post.createdAt.substring(0, 16).replace("T", " ") : ""}
                                </td>
                                {/* 좋아요/댓글 */}
                                <td>
                                    <span className="like-badge">{post.likeCount ?? 0}</span>
                                </td>
                                <td>
                                    <span className="comment-badge">{post.commentCount ?? 0}</span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="board-pagination" style={{ marginBottom: 14 }}>
                <button onClick={() => setPage(prev => Math.max(prev-1, 0))} disabled={page === 0}>이전</button>
                <span>{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(prev => Math.min(prev+1, totalPages-1))} disabled={page+1 === totalPages}>다음</button>
            </div>
            <div className="board-search-bar">
                <div style={{ position: "relative", display: "inline-block" }}>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="제목, 작성자 검색"
                        style={{ 
                            padding: "8px 36px 8px 16px",
                            borderRadius: 7, 
                            border: "1px solid #ececec", 
                            fontSize: 16 
                        }}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput("")}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                fontSize: 20,
                                color: "#bbb",
                                cursor: "pointer",
                                padding: 0,
                                lineHeight: 1,
                                zIndex: 2
                            }}
                            tabIndex={-1}
                            aria-label="검색어 지우기"
                        >×</button>
                    )}
                </div>
                <button 
                    onClick={() =>  {
                        setSearch(searchInput);
                        setPage(0);
                    }}
                    style={{ 
                        marginLeft: 8, 
                        padding: "8px 16px", 
                        borderRadius: 7, 
                        background: "#e03e3e", 
                        color: "#fff", 
                        border: "none" 
                    }}>
                    검색
                </button>
            </div>
        </div>
    );
}
