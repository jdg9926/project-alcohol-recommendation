import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './MainHeader.css';

const MainHeader = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="main-header">
            <nav className="header-nav-links" aria-label="메인 네비게이션">
                <NavLink
                    to="/"
                    className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                >
                    포트폴리오
                </NavLink>
                <NavLink
                    to="/wine"
                    className={({ isActive }) =>
                        'nav-link' + (isActive && window.location.pathname === '/' ? ' active' : '')
                    }
                    end
                >
                    와인 추천
                </NavLink>
                <NavLink
                    to="/board"
                    className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                >
                    게시판
                </NavLink>
            </nav>
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
};

export default MainHeader;
