import { createContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getMe } from './api/auth';

export const AuthContext = createContext({
    user: null,
    setUser: () => {},
    logout: () => {},
    loginToken: null,
    setLoginToken: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loginToken, setLoginToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 로그인 상태 복원 및 동기화
    useEffect(() => {
        const fetchUser = async () => {
            if (loginToken) {
                try {
                    const me = await getMe();
                    setUser(me);
                    localStorage.setItem('user', JSON.stringify(me));
                } catch (err) {
                    console.error("getMe() 호출 실패:", err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setLoginToken(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        };
        fetchUser();
    }, [loginToken]);

    // 로그아웃 함수
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoginToken(null);
    };

    const contextValue = useMemo(() => ({
        user,
        setUser,
        logout,
        loginToken,
        setLoginToken,
    }), [user, loginToken]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
