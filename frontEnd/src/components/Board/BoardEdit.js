import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill-new";
import { BASE_URL } from "../../api/baseUrl";

import "react-quill-new/dist/quill.snow.css";
import "./Board.css";

export default function BoardEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 게시글, 첨부파일 상태
    const [form, setForm] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(true);
    const [oldFiles, setOldFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const location = useLocation();
    const boardType = new URLSearchParams(location.search).get('boardType') || "ALL";

    // 파일 제한 상수
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // 파일 추가 (중복/용량/총개수 제한)
    const addFiles = useCallback(
        (newAdd) => {
            let updated = [...newFiles];
            const keptOld = oldFiles.filter(f => !f.deleted).length;
            for (const file of newAdd) {
                if (keptOld + updated.length >= MAX_FILES) {
                    alert(`최대 ${MAX_FILES}개까지 등록할 수 있습니다.`);
                    break;
                }
                if (file.size > MAX_FILE_SIZE) {
                    alert(`${file.name} 파일은 10MB를 초과하여 첨부할 수 없습니다.`);
                    continue;
                }
                // 동일 파일(이름, 용량) 중복 방지
                if (updated.find(f => f.name === file.name && f.size === file.size)) continue;
                updated.push(file);
            }
            setNewFiles(updated);
        },
        [oldFiles, newFiles, MAX_FILE_SIZE]
    );

    // 드롭 핸들러
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setIsDragActive(false);
            const droppedFiles = Array.from(e.dataTransfer.files);
            addFiles(droppedFiles);
        },
        [addFiles]
    );

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        addFiles(Array.from(e.target.files));
        e.target.value = "";
    };

    // 파일 미리보기(이미지)
    const [previews, setPreviews] = useState([]);
    useEffect(() => {
        const imagePreviews = newFiles.map(file =>
            file.type.startsWith("image/") ? URL.createObjectURL(file) : null
        );
        setPreviews(imagePreviews);
        return () => imagePreviews.forEach(url => url && URL.revokeObjectURL(url));
    }, [newFiles]);

    // 기존 첨부파일 토글 삭제/복원
    const handleRemoveOld = idx => {
        setOldFiles(oldFiles =>
            oldFiles.map((f, i) =>
                i === idx ? { ...f, deleted: !f.deleted } : f
            )
        );
    };
    // 새 파일 삭제
    const removeNewFile = idx => {
        setNewFiles(prev => prev.filter((_, i) => i !== idx));
    };

    // 기존 내용+첨부파일 불러오기
    useEffect(() => {
        fetch(`${BASE_URL}:8888/api/board/${id}`)
            .then(res => res.json())
            .then(data => {
                setForm({ title: data.title, content: data.content });
                if (data.fileNames) {
                    setOldFiles(data.fileNames.map((save, i) => ({
                        save,
                        origin: data.originFileNames?.[i] || save,
                        deleted: false,
                    })));
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    // 제목/내용 입력 핸들러
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 제출
    const handleSubmit = async e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("content", form.content);

        // 기존 파일 중 남길 파일명만 전달(삭제 체크된 것은 제외)
        oldFiles.forEach(f => {
            if (!f.deleted) formData.append("remainFiles", f.save);
        });

        // 새 파일 추가
        newFiles.forEach(f => formData.append("files", f));

        try {
            const token = localStorage.getItem("token"); // 꼭 토큰 불러오기
            const res = await fetch(`${BASE_URL}:8888/api/board/${id}`, {
                method: "PUT",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}, // 로그인 안 했으면 비워둠
                body: formData,
            });
            if (!res.ok) throw new Error("수정 실패");
            alert("수정되었습니다!");
            navigate(`/board/${id}?boardType=${boardType}`);
        } catch (err) {
            alert(err.message || "수정에 실패했습니다.");
        }
    };

    if (loading) return <div className="board-detail-loading">불러오는 중...</div>;

    // 툴바 옵션 (글쓰기/수정 동일)
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    console.log("oldFiles :::", oldFiles);
    console.log("newFiles :::", newFiles);

    return (
        <div className="board-write-form">
            <h2>게시글 수정</h2>
            <div style={{
                marginBottom: 20,
                fontSize: 18,
                color: "#e03e3e"
            }}>
            {boardType === "ALL" ? "전체게시판"
            : boardType === "GENERAL" ? "일반게시판"
            : boardType === "ERROR" ? "에러게시판"
            : boardType === "AI" ? "AI 추천게시판"
            : boardType}
            </div>
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
                <div className="quill-editor-wrap">
                    <ReactQuill
                        value={form.content}
                        onChange={val => setForm(f => ({ ...f, content: val }))}
                        modules={quillModules}
                        theme="snow"
                        placeholder="내용을 입력하세요"
                        style={{ height: 320, marginBottom: 36 }}
                    />
                </div>
                {/* 기존 첨부파일 */}
                {oldFiles.length > 0 && (
                    <div className="file-preview-list" style={{marginBottom: 10}}>
                        <b>기존 첨부파일:</b>
                        <ul className="file-preview-list">
                            {oldFiles.map((f) => (
                                <li key={f.save} className="file-preview-item">
                                    <span 
                                        style={{
                                            textDecoration: f.deleted ? "line-through" : "none",
                                            color: f.deleted ? "#aaa" : "#444"
                                        }}
                                    >
                                        {f.origin}
                                    </span>
                                    <button
                                        type="button"
                                        className="file-remove-btn"
                                        onClick={() => handleRemoveOld(f.save)}
                                    >
                                        {f.deleted ? "복원" : "삭제"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* 새 첨부파일 */}
                <button
                    type="button"
                    className={`file-dropzone${isDragActive ? " drag-active" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    tabIndex={0}
                    onClick={() => fileInputRef.current.click()}
                    style={{ outline: isDragActive ? "2px solid #2563eb" : "none" }}
                >
                    <label style={{color:"#2563eb", textDecoration:"underline", cursor:"pointer"}}>
                        여기
                        <input
                            type="file"
                            multiple
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="*"
                        />
                    </label>
                    를 클릭해 파일 추가
                    <span className="file-info">
                        (최대 {MAX_FILES}개, 10MB 이하 파일만 첨부)
                    </span>
                </button>
                {/* 새 첨부파일 리스트 */}
                {newFiles.map((f, i) => (
                    <li key={f.name + '_' + f.size + '_' + f.lastModified}
                        className="file-preview-item"
                    >
                        {previews[i] ? (
                            <img
                                src={previews[i]}
                                alt={f.name}
                                className="file-thumb"
                            />
                        ) : (
                            <span className="file-icon" style={{ marginRight: 8 }}>📎</span>
                        )}
                        <span>{f.name}</span>
                        <button
                            type="button"
                            className="file-remove-btn"
                            onClick={() => removeNewFile(i)}
                        >삭제
                        </button>
                    </li>
                ))}
                <div className="board-write-btns">
                    <button type="submit" className="board-write-btn">저장</button>
                    <button type="button" className="board-write-btn board-write-cancel" onClick={() => navigate(`/board/${id}?boardType=${boardType}`)}>취소</button>
                </div>
            </form>
        </div>
    );
}
