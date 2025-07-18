import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Board.css";

export default function BoardWrite() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        let errorTitle = '';
        let errorDetail = '';
        let statusCode = '';
        let statusText = '';
        let errorMessage = '';
        try {
            const response = await fetch("http://43.200.182.46:8888/api/board/write", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content,
                    author: "익명"
                })
            });
            if (!response.ok) {
                statusCode = response.status;
                statusText = response.statusText;
                try {
                    const data = await response.json();
                    errorMessage = data.detail || data.message || JSON.stringify(data);
                    errorTitle = `${statusCode} ${data.title || statusText}`;
                    errorDetail = `${statusCode} ${data.title || statusText} "${errorMessage}"`;
                } catch (err) {
                    const text = await response.text();
                    errorDetail = `${statusCode} ${statusText} "${text}"`;
                }
                throw new Error("글 등록에 실패하였습니다.");
            }
            alert("글이 등록되었습니다!");
            navigate("/board");
        } catch (err) {
            setError(err.message);
            // ---- 에러 내용 게시판에 업로드 ----
            try {
                await fetch("http://43.200.182.46:8888/api/board/write", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: `[ERROR] 게시글 등록 실패 ${errorTitle}`,
                        content: `
                            에러 발생 시각: ${new Date().toLocaleString()}
                            입력 제목: ${title}
                            입력 내용 길이: ${content?.length}
                            에러 상세: ${errorDetail}
                        `,
                        author: "SYSTEM"
                    })
                });
            } catch (logErr) {
                console.error("에러 로그도 등록 실패:", logErr);
            }
        } finally {
            setLoading(false);
        }
    };

    // 툴바 커스터마이즈 (필요 시 확장 가능)
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    return (
        <div className="board-write-form">
            <h2>글쓰기</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="board-input"
                    required
                    disabled={loading}
                />
                <div className="quill-editor-wrap">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        theme="snow"
                        placeholder="내용을 입력하세요"
                        style={{ height: 320, marginBottom: 36 }}
                        readOnly={loading}
                    />
                </div>
                {error && (
                    <div className="board-error">
                        {error}
                    </div>
                )}
                <div className="board-write-btns">
                    <button type="submit" className="board-write-btn" disabled={loading}>
                        {loading ? "등록 중..." : "등록"}
                    </button>
                    <button
                        type="button"
                        className="board-write-btn board-write-cancel"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}
