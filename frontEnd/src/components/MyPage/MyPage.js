// src/components/MyPage/MyPage.js
import { useContext, useState, useMemo } from "react";
import { AuthContext } from "../../AuthContext";
import MyPostsList from "./MyPostsList";
import MyCommentsList from "./MyCommentsList";
import MyScrapList from "./MyScrapList";
import MyLikeList from "./MyLikeList";
import ProfileEdit from "./ProfileEdit";
import PasswordChange from "./PasswordChange";
import ProfileImageUploader from "./ProfileImageUploader";
import DeleteAccount from "./DeleteAccount";
import MessageInbox from "./MessageInbox";
import MessageSent from "./MessageSent";
import MessageCompose from "./MessageCompose";
import "./MyPage.css";

export default function MyPage() {
    const { user, setUser } = useContext(AuthContext);
    const [tab, setTab] = useState("posts");

    const tabs = useMemo(
        () => [
        { key: "posts", label: "내 글", component: <MyPostsList user={user} /> },
        { key: "comments", label: "내 댓글", component: <MyCommentsList user={user} /> },
        { key: "scrap", label: "스크랩", component: <MyScrapList user={user} /> },
        { key: "like", label: "좋아요", component: <MyLikeList user={user} /> },
        { key: "messages-inbox", label: "받은 쪽지", component: <MessageInbox /> },
        { key: "messages-sent", label: "보낸 쪽지", component: <MessageSent /> },
        { key: "message-compose", label: "쪽지 보내기", component: <MessageCompose /> },
        { key: "profile", label: "회원정보 수정", component: <ProfileEdit user={user} /> },
        { key: "password", label: "비밀번호 변경", component: <PasswordChange /> },
        { key: "deleteAccount", label: "회원 탈퇴", component: <DeleteAccount /> },
        ],
        [user]
    );

    if (!user) return <div>로그인이 필요합니다.</div>; // ✅ Hook 이후에 배치

    const activeTab = tabs.find((t) => t.key === tab);

    return (
        <div className="mypage-wrap">
            {/* 프로필 영역 */}
            <div className="mypage-profile">
                <h2>마이페이지</h2>
                <ProfileImageUploader
                    currentImage={user?.profileImage || "/default-avatar.png"}
                    onUpload={(newUrl) => setUser({ ...user, profileImage: newUrl })}
                />
                <div>닉네임: {user.nickname}</div>
                <div>이메일: {user.email}</div>
                <div>가입일: {user.createdAt?.slice(0, 10)}</div>
            </div>

            {/* 탭 버튼 */}
            <div className="mypage-tabs">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={tab === key ? "active" : ""}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 탭 내용 */}
            <div className="mypage-content">
                {activeTab?.component || <div>잘못된 탭입니다.</div>}
            </div>
        </div>
    );
}
