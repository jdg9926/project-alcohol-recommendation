// src/components/MyPage/DeleteAccount.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { clearAccessToken } from "../../api/token";

export default function DeleteAccount() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!window.confirm("정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;

        setLoading(true);
        try {
            await api("/api/users/me", { method: "DELETE" });
            clearAccessToken();
            alert("회원 탈퇴가 완료되었습니다.");
            navigate("/");
        } catch (err) {
            alert(err.message || "회원 탈퇴에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>회원 탈퇴</h3>
            <p>탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
            <button onClick={handleDelete} disabled={loading}>
                {loading ? "탈퇴 중..." : "회원 탈퇴하기"}
            </button>
        </div>
    );
}
