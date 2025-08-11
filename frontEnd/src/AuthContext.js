import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { getMe, refreshToken } from "./api/auth"; // refreshToken API 추가

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loginToken, setLoginToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setLoginToken(null);
        setUser(null);
    }, []);

    // JWT 만료 시간 파싱 함수
    const getTokenExpiry = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000; // ms 변환
        } catch {
            return null;
        }
    };

    // 토큰 갱신
    const tryRefreshToken = useCallback(async () => {
        try {
            const newToken = await refreshToken(); // 서버에서 새 Access Token 반환
            if (newToken) {
                localStorage.setItem("token", newToken);
                setLoginToken(newToken);
            }
        } catch (e) {
            console.error("토큰 갱신 실패:", e);
            logout();
        }
    }, [logout]);

    // 앱 시작 시 토큰 확인 및 유저 정보 로드
    useEffect(() => {
        (async () => {
            if (!loginToken) {
                setLoading(false);
                return;
            }
            try {
                const expiry = getTokenExpiry(loginToken);
                if (expiry) {
                    const now = Date.now();
                    const timeLeft = expiry - now;

                    // 만료까지 5분 미만이면 토큰 갱신
                    if (timeLeft < 5 * 60 * 1000) {
                        await tryRefreshToken();
                    }
                }

                const me = await getMe(localStorage.getItem("token"));
                setUser(me);
            } catch (e) {
                if (e.status === 401) logout();
            } finally {
                setLoading(false);
            }
        })();
    }, [loginToken, logout, tryRefreshToken]);

    const contextValue = useMemo(
        () => ({
            user,
            setUser,
            loginToken,
            setLoginToken,
            logout,
        }),
        [user, loginToken, logout]
    );

    if (loading) return <div>로딩 중...</div>;

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
