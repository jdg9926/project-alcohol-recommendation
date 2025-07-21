import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { BASE_URL } from "../../api/baseUrl";
import { logErrorToBoard } from "../../utils/errorLogger";

import { useContext } from "react";
import { AuthContext } from "../../AuthContext";

import "react-quill/dist/quill.snow.css";
import "./Board.css";

export default function BoardWrite() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const { loginToken, user } = useContext(AuthContext);

    // 파일 제한 상수
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Drag & Drop 핸들러
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    // 파일 추가(중복/용량/갯수 제한)
    const addFiles = useCallback((newFiles) => {
        let updated = [...files];
        for (const file of newFiles) {
            if (updated.length >= MAX_FILES) {
                alert(`최대 ${MAX_FILES}개까지 등록할 수 있습니다.`);
                break;
            }
            if (file.size > MAX_FILE_SIZE) {
                alert(`${file.name} 파일은 10MB를 초과하여 첨부할 수 없습니다.`);
                continue;
            }
            if (updated.find(f => f.name === file.name && f.size === file.size)) continue;
            updated.push(file);
        }
        if (updated.length > MAX_FILES) updated = updated.slice(0, MAX_FILES);
        setFiles(updated);
    }, [files, MAX_FILES, MAX_FILE_SIZE]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, [addFiles]);

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        addFiles(Array.from(e.target.files));
        e.target.value = "";
    };

    // 파일 미리보기 삭제
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 파일 미리보기(이미지용) - 선택사항
    const [previews, setPreviews] = useState([]);
    useEffect(() => {
        const imagePreviews = files.map(file =>
            file.type.startsWith("image/") ? URL.createObjectURL(file) : null
        );
        setPreviews(imagePreviews);
        return () => imagePreviews.forEach(url => url && URL.revokeObjectURL(url));
    }, [files]);

    // 폼 제출
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
            formData.append("author", user?.nickname);
            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await fetch(apiPath, {
                method: "POST",
                headers: {
                    "Authorization": loginToken ? `Bearer ${loginToken}` : undefined
                },
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
                    className={`file-dropzone${isDragActive ? " drag-active" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnter={handleDragOver}
                    tabIndex={0}
                    role="button"
                    onClick={() => !loading && fileInputRef.current.click()}
                    style={{ outline: isDragActive ? "2px solid #2563eb" : "none" }}
                >
                    파일을 이곳에 드래그하거나{" "}
                    <span
                        style={{
                            color: "#2563eb",
                            textDecoration: "underline",
                            cursor: "pointer"
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            !loading && fileInputRef.current.click();
                        }}
                    >여기</span>
                    를 클릭해 첨부하세요.
                    <input
                        ref={fileInputRef}
                        id="fileInput"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        disabled={loading}
                        accept="*"
                    />
                    <span className="file-info">
                        (최대 {MAX_FILES}개, 10MB 이하 파일만 첨부)
                    </span>
                </div>

                {/* 파일 미리보기 */}
                <ul className="file-preview-list">
                    {files.map((file, i) => (
                        <li key={i} className="file-preview-item">
                            {previews[i] ? (
                                <img
                                    src={previews[i]}
                                    alt={file.name}
                                    className="file-thumb"
                                />
                            ) : (
                                <span className="file-icon" style={{ marginRight: 8 }}>📎</span>
                            )}
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
