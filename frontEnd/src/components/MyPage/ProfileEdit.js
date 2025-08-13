import { useState, useContext } from "react";
import { BASE_URL } from "../../api/baseUrl";
import { AuthContext } from "../../AuthContext";

export default function ProfileEdit() {
	const { user, loginToken, setUser } = useContext(AuthContext);
	const [nickname, setNickname] = useState(user?.nickname ?? "");
	const [message, setMessage] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		if (!nickname || nickname.trim().length < 2) {
			setMessage("닉네임은 2자 이상 입력해주세요.");
			return;
		}
		try {
			setSaving(true);
			const formData = new FormData();
			formData.append("nickname", nickname.trim());

			const response = await fetch(`${BASE_URL}/myPage/myEdit`, {
				method: "PUT",
				headers: { Authorization: `Bearer ${loginToken}` },
				body: formData
			});

			if (!response.ok) {
				setMessage("수정 오류");
				return;
			}
			const data = await response.json();
			setUser((prev) => ({ ...prev, nickname: data?.nickname ?? nickname.trim() }));
			setMessage("닉네임이 수정되었습니다.");
		} catch (err) {
			setMessage("수정 오류");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="mypage-profile">
			<h2>프로필 수정</h2>
			<form className="profile-edit-form" onSubmit={handleSubmit}>
				<div className="form-row">
					<label htmlFor="nickname">닉네임</label>
					<input
						id="nickname"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						className="profile-edit-input"
						minLength={2}
						maxLength={20}
						required
					/>
				</div>
				<button type="submit" className="profile-edit-btn" disabled={saving}>
					{saving ? "수정 중..." : "수정"}
				</button>
				{message && <div className="profile-edit-message">{message}</div>}
			</form>
		</div>
	);
}
