import { useState, useRef, useCallback, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthContext } from "../../AuthContext";
import { logErrorToBoard } from "../../utils/errorLogger";
import { BASE_URL } from "../../api/baseUrl";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./Board.css";

const boardTypeLabel = {
    ALL: "전체게시판",
    GENERAL: "일반게시판",
    ERROR: "에러게시판",
    AI: "AI 추천게시판"
};

export default function BoardWrite() {
    const navigate = useNavigate();
    const { loginToken, user } = useContext(AuthContext);

    // 폼 관리
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);

    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const boardType = searchParams.get('boardType') || 'GENERAL'; // 기본값

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

        if (!title?.trim()) return alert("제목은 필수입니다.");
        if (!content?.trim()) return alert("내용은 필수입니다.");

        setLoading(true);
        setError(null);

        try {
            // FormData로 게시글 + 파일 첨부
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("author", user?.nickname);
            formData.append("boardType", boardType);
            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await fetch(`${BASE_URL}:8888/api/board/write`, {
                method: "POST",
                headers: {
                    "Authorization": loginToken ? `Bearer ${loginToken}` : undefined
                },
                body: formData,
            });

            if (!response.ok) {
                // 서버에서 에러 메시지를 텍스트로 읽음 (FormData라 json이 아닐 수 있음)
                const errorText = await response.text();
                throw new Error(errorText || "글 등록에 실패하였습니다.");
            } else {
                alert("글이 등록되었습니다!");
                navigate(`/?boardType=${boardType}`);
            }
        } catch (err) {
            await logErrorToBoard({
                BASE_URL,
                title: "게시글 등록",
                errorDetail: err.message,
                originTitle: title,
                apiPath: "/api/board/write",
                userInfo: user,
                extraData: { boardType: "ERROR" },
                loginToken
            });
            console.log(err)
            setError(err.message);
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

    console.log("files :::", files);

    return (
        <div className="board-write-form">
            <h2>글쓰기</h2>
            <form onSubmit={handleSubmit}>
                <div style={{
                    marginBottom: 20,
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#e03e3e"
                }}>
                    {boardTypeLabel[boardType] || boardType}
                </div>
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
                <button
                    type="button"
                    className={`file-dropzone${isDragActive ? " drag-active" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnter={handleDragOver}
                    tabIndex={0}
                    style={{ outline: isDragActive ? "2px solid #2563eb" : "none", width: "100%" }}
                    disabled={loading}
                >
                파일을 이곳에 드래그하거나{" "}
                <label
                    htmlFor="fileInput"
                    style={{
                        color: "#2563eb",
                        textDecoration: "underline",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "inline"
                    }}
                    onClick={e => e.stopPropagation()} // 드롭존의 onClick 이벤트 전파 막기
                >
                    여기
                </label>
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
                <span className="file-info" style={{ display: "block", marginTop: 8 }}>
                    (최대 {MAX_FILES}개, 10MB 이하 파일만 첨부)
                </span>
                </button>

                {/* 파일 미리보기 */}
                <ul className="file-preview-list">
                    {files.map((file, i) => (
                        <li
                            key={file.name + '_' + file.size + '_' + file.lastModified}
                            className="file-preview-item"
                        >
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
                            >삭제
                            </button>
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
