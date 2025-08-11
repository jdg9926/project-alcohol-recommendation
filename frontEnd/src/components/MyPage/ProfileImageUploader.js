import { useState } from "react";
import PropTypes from "prop-types";
import "./ProfileImageUploader.css"; // 스타일 분리

export default function ProfileImageUploader({ currentImage, onUpload }) {
    const [preview, setPreview] = useState(currentImage);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 미리보기
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // 업로드 API 호출
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/user/profile-image", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!res.ok) throw new Error("업로드 실패");
            const data = await res.json();
            onUpload(data.imageUrl); // 업로드 성공 시 콜백 호출
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="profile-uploader">
            <img
                src={preview}
                alt="프로필"
                className="profile-image"
                onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            <label className="upload-btn">
                이미지 변경
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
        </div>
    );
}

ProfileImageUploader.propTypes = {
    currentImage: PropTypes.string.isRequired,
    onUpload: PropTypes.func.isRequired
};
