import axios from "axios";

export async function uploadProfileImage(formData) {
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/user/profile-image", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data.url; // 서버가 반환하는 이미지 URL
}
