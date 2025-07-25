import { useState, useContext } from "react";
import { BASE_URL } from "../../api/baseUrl";
import { AuthContext } from "../../AuthContext";

export default function PasswordChange() {
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { loginToken } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // 입력값 유효성 체크
        if (!oldPw || !newPw || !confirmPw) {
            setMessage("모든 항목을 입력해주세요.");
            return;
        }
        if (newPw.length < 6) {
            setMessage("새 비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        if (newPw !== confirmPw) {
            setMessage("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}:8888/myPage/myPwChange`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${loginToken}`
                },
                body: JSON.stringify({
                    oldPassword: oldPw,
                    newPassword: newPw
                })
            });

            let data = {};
            try {
                data = await response.json();
            } catch (jsonError) {
                // 서버가 JSON이 아닌 값을 반환하는 경우 등
                setMessage("서버에서 올바른 응답을 받지 못했습니다.");
            }

            if (response.ok) {
                setMessage("비밀번호가 성공적으로 변경되었습니다!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setMessage(data?.message || "비밀번호 변경 실패");
            }
        } catch (error) {
            setMessage("비밀번호 변경 중 네트워크 오류가 발생했습니다.");
            console.error("비밀번호 변경 요청 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="password-change-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label htmlFor="oldPw">현재 비밀번호</label>
                <input
                    type="password"
                    id="oldPw"
                    className="profile-edit-input"
                    value={oldPw}
                    onChange={e => setOldPw(e.target.value)}
                />
            </div>
            <div className="form-row">
                <label htmlFor="newPw">새 비밀번호</label>
                <input
                    type="password"
                    id="newPw"
                    className="profile-edit-input"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                />
            </div>
            <div className="form-row">
                <label htmlFor="confirmPw">새 비밀번호 확인</label>
                <input
                    type="password"
                    id="confirmPw"
                    className="profile-edit-input"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                />
            </div>
            <button className="profile-edit-btn" type="submit" disabled={loading}>
                {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
            {message && <div className="profile-edit-message">{message}</div>}
        </form>
    );
}
