import { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext";
import MyPostsList from "./MyPostsList";
import MyCommentsList from "./MyCommentsList";
import MyScrapList from "./MyScrapList";
import MyLikeList from "./MyLikeList";
import ProfileEdit from "./ProfileEdit";
import PasswordChange from "./PasswordChange";

import './MyPage.css';

export default function MyPage() {
    const { user } = useContext(AuthContext);
    const [tab, setTab] = useState("posts");

    if (!user) return <div>로그인이 필요합니다.</div>;

    return (
        <div className="mypage-wrap">
            <div className="mypage-profile">
                <h2>마이페이지</h2>
                <div>닉네임: {user.nickname}</div>
                <div>이메일: {user.email}</div>
                <div>가입일: {user.createdAt?.slice(0, 10)}</div>
            </div>

            <div className="mypage-tabs">
                <button onClick={() => setTab("posts")} className={tab === "posts" ? "active" : ""}>내 글</button>
                <button onClick={() => setTab("comments")} className={tab === "comments" ? "active" : ""}>내 댓글</button>
                <button onClick={() => setTab("scrap")} className={tab === "scrap" ? "active" : ""}>스크랩</button>
                <button onClick={() => setTab("like")} className={tab === "like" ? "active" : ""}>좋아요</button>
                <button onClick={() => setTab("profile")} className={tab === "profile" ? "active" : ""}>회원정보 수정</button>
                <button onClick={() => setTab("password")} className={tab === "password" ? "active" : ""}>비밀번호 변경</button>
            </div>

            <div className="mypage-content">
                {tab === "posts" && <MyPostsList user={user} />}
                {tab === "comments" && <MyCommentsList user={user} />}
                {tab === "scrap" && <MyScrapList user={user} />}
                {tab === "like" && <MyLikeList user={user} />}
                {tab === "profile" && <ProfileEdit user={user} />}
                {tab === "password" && <PasswordChange user={user} />}
            </div>
        </div>
    );
}
