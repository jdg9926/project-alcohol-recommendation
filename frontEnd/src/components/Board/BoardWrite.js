import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { BASE_URL } from "../../api/baseUrl";
import { logErrorToBoard } from "../../utils/errorLogger";

import "react-quill/dist/quill.snow.css";
import "./Board.css";

export default function BoardWrite() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Drag & Drop 핸들러
    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };
    const handleDragOver = (e) => e.preventDefault();

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    // 파일 미리보기 삭제
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 에러 정보 변수 초기화
        let errorTitle = "";
        let errorDetail = "";
        let statusCode = "";
        let statusText = "";
        let errorMessage = "";

        // API 경로 (로깅 및 요청에 사용)
        const apiPath = `${BASE_URL}:8888/api/board/write`;

        try {
            // FormData로 게시글 + 파일 첨부
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("author", "익명");
            files.forEach((file) => {
                formData.append("files", file);
            });

            // 실제 요청 (Content-Type 생략!)
            const response = await fetch(apiPath, {
                method: "POST",
                body: formData,
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
                    errorTitle = `${statusCode} ${statusText}`;
                }
                throw new Error("글 등록에 실패하였습니다.");
            }

            alert("글이 등록되었습니다!");
            navigate("/board");
        } catch (err) {
            setError(err.message);

            // 에러 발생 시 SYSTEM 글로 에러 남김
            await logErrorToBoard({
                BASE_URL,
                title: errorTitle,
                errorDetail,
                originTitle: title,
                contentLength: content?.length,
                apiPath,
                extraData: { filesCount: files?.length }
            });
        } finally {
            setLoading(false);
        }
    };



    // 툴바 커스터마이즈
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

                {/* Drag & Drop 파일 업로드 */}
                <div
                    className="file-dropzone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    파일을 이곳에 드래그하거나{" "}
                    <label htmlFor="fileInput" style={{ color: "#2563eb", textDecoration: "underline", cursor: "pointer" }}>
                        여기
                    </label>
                    를 클릭해 첨부하세요.
                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </div>

                {/* 파일 미리보기 */}
                <ul className="file-preview-list">
                    {files.map((file, i) => (
                        <li key={i} className="file-preview-item">
                            <span>{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="file-remove-btn"
                                disabled={loading}
                            >삭제</button>
                        </li>
                    ))}
                </ul>

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
