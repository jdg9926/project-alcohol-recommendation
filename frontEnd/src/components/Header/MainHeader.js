import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './MainHeader.css';

const MainHeaders = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="main-header">
            {/* 상단 네비게이션 탭 */}
            <nav className="header-nav-links">
                <Link to="/" className="nav-link">
                    와인 추천
                </Link>
                <Link to="/board" className="nav-link">
                    게시판
                </Link>
            </nav>
            <div className="header-auth-buttons">
                {user ? (
                    <button onClick={handleLogout} className="logout-button">
                        로그아웃
                    </button>
                ) : (
                    <>
                        <Link to="/signup" className="signup-button">
                            회원가입
                        </Link>
                        <Link to="/login" className="login-button">
                            로그인
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default MainHeaders;
