import { useState, useContext } from "react";
import { BASE_URL } from "../../api/baseUrl";
import { AuthContext } from "../../AuthContext";

export default function ProfileEdit() {
    const { user, loginToken, setUser } = useContext(AuthContext);
    const [nickname, setNickname] = useState(user?.nickname ?? "");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("nickname", nickname);

            const response = await fetch(`${BASE_URL}:8888/myPage/myEdit`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${loginToken}` },
                body: formData,
            });

            if (!response.ok) {
                setMessage("수정 오류");
            } else {
                setMessage("닉네임이 수정되었습니다.");
                const data = await response.json();
                if (data?.nickname) setUser(data);

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

        } catch (err) {
            setMessage("수정 오류");
            // 필요시: console.error(err);
        }
    };

    return (
        <div className="mypage-wrap">
            <div className="mypage-profile">
                <h2>프로필 수정</h2>
                <form className="profile-edit-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="nickname">닉네임</label>
                        <input
                            id="nickname"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="profile-edit-input"
                        />
                    </div>
                    <button type="submit" className="profile-edit-btn">수정</button>
                    {message && <div className="profile-edit-message">{message}</div>}
                </form>
            </div>
        </div>
    );
}
