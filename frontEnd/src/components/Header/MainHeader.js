import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { api } from "../../api/client";
import { AuthContext } from "../../AuthContext";
import "./MainHeader.css";

export default function MainHeader() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // 미읽음 쪽지 카운트 가져오기 (30초마다 갱신)
    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                const { count } = await api("/api/messages/unread-count");
                setUnreadCount(count ?? 0);
            } catch (err) {
                console.error("미읽음 쪽지 카운트 불러오기 실패:", err);
            }
        };

        fetchUnreadCount();
        const timer = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(timer);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="main-header">
            {/* 네비게이션 */}
            <nav className="header-nav-links" aria-label="메인 네비게이션">
                <NavLink to="/" className={({ isActive }) =>
                    "nav-link" + (isActive && window.location.pathname === "/" ? " active" : "")
                } end>
                    와인 추천
                </NavLink>

                <NavLink to="/board" className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                }>
                    게시판
                </NavLink>

                {user && (
                    <>
                        <NavLink to="/messages" className={({ isActive }) =>
                            "nav-link messages-link" + (isActive ? " active" : "")
                        }>
                            <div className="message-icon-wrapper">
                                <FaEnvelope size={18} />
                                {unreadCount > 0 && (
                                    <span className="message-badge">{unreadCount}</span>
                                )}
                            </div>
                            쪽지함
                        </NavLink>

                        <NavLink to="/messages/send" className={({ isActive }) =>
                            "nav-link messages-send-link" + (isActive ? " active" : "")
                        }>
                            <div className="message-icon-wrapper">
                                <FaPaperPlane size={18} />
                            </div>
                            쪽지 보내기
                        </NavLink>
                    </>
                )}
            </nav>

            {/* 우측 버튼 */}
            <div className="header-auth-buttons">
                {user ? (
                    <>
                        <span className="user-nickname">{user.nickname}님</span>
                        <NavLink to="/mypage" className="header-btn mypage-button">
                            마이페이지
                        </NavLink>
                        <button onClick={handleLogout} className="header-btn logout-button">
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/signup" className="header-btn signup-button">
                            회원가입
                        </NavLink>
                        <NavLink to="/login" className="header-btn login-button">
                            로그인
                        </NavLink>
                    </>
                )}
            </div>
        </header>
    );
}
