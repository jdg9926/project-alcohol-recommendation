import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Board.css";

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

    useEffect(() => {
        setLoading(true);
        let url = `http://localhost:8888/api/board/list?page=${page}&size=${size}&sort=createdAt,${sortOrder}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
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
    }, [page, size, search, sortOrder]);

    return (
        <div className="board-container">
            <div className="board-header">
                <h2 className="board-title">게시판</h2>
                <Link to="write" className="board-write-btn">글쓰기</Link>
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
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="board-empty-row" colSpan={4}>
                                <span style={{ fontSize: 18, color: "#aaa" }}>불러오는 중...</span>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td className="board-empty-row" colSpan={4}>
                                <span style={{ color: "#e03e3e" }}>{error}</span>
                            </td>
                        </tr>
                    ) : posts.length === 0 ? (
                        <tr>
                            <td className="board-empty-row" colSpan={4}>
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
                                <Link to={`${post.id}`} className="board-link">
                                    {post.title}
                                </Link>
                            </td>
                            <td className="board-col-author">
                                {post.author}
                            </td>
                            <td className="board-col-date">
                                {post.createdAt ? post.createdAt.substring(0, 16).replace("T", " ") : ""}
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
