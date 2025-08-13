// src/components/MyPage/MyPage.js
import { useContext, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import MyPostsList from "./MyPostsList";
import MyCommentsList from "./MyCommentsList";
import MyScrapList from "./MyScrapList";
import MyLikeList from "./MyLikeList";
import ProfileEdit from "./ProfileEdit";
import PasswordChange from "./PasswordChange";
import DeleteAccount from "./DeleteAccount";
import "./MyPage.css";

export default function MyPage() {
	const { user } = useContext(AuthContext);
	const [params, setParams] = useSearchParams();
	const tab = params.get("tab") || "posts";

	const switchTab = useCallback((key) => {
		const next = new URLSearchParams(params);
		next.set("tab", key);
		setParams(next, { replace: true });
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [params, setParams]);

	const tabs = useMemo(
		() => [
			{ key: "posts", label: "내 글", component: <MyPostsList user={user} /> },
			{ key: "comments", label: "내 댓글", component: <MyCommentsList user={user} /> },
			{ key: "scrap", label: "스크랩", component: <MyScrapList user={user} /> },
			{ key: "like", label: "좋아요", component: <MyLikeList user={user} /> },
			{ key: "profile", label: "회원정보 수정", component: <ProfileEdit user={user} /> },
			{ key: "password", label: "비밀번호 변경", component: <PasswordChange /> },
			{ key: "deleteAccount", label: "회원 탈퇴", component: <DeleteAccount /> }
		],
		[user]
	);

	if (!user) return <div className="mypage-wrap">로그인이 필요합니다.</div>;

	const activeTab = tabs.find((t) => t.key === tab) ?? tabs[0];

	return (
		<div className="mypage-wrap">
			{/* 프로필 영역 (이미지 제거) */}
			<div className="mypage-profile">
				<h2>마이페이지</h2>
				<div>닉네임: {user.nickname}</div>
				<div>이메일: {user.email}</div>
				<div>가입일: {user.createdAt?.slice(0, 10)}</div>
			</div>

			{/* 탭 버튼 */}
			<div className="mypage-tabs" role="tablist" aria-label="마이페이지 탭">
				{tabs.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => switchTab(key)}
						className={tab === key ? "active" : ""}
						role="tab"
						aria-selected={tab === key}
					>
						{label}
					</button>
				))}
			</div>

			{/* 탭 내용 */}
			<div className="mypage-content">
				{activeTab.component}
			</div>
		</div>
	);
}
