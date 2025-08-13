// src/AuthContext.js
import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { getMe, refreshToken, logoutApi } from "./api/auth";
import { getAccessToken, setAccessToken, clearAccessToken } from "./api/token";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loginToken, setLoginTokenState] = useState(getAccessToken());
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	const setLoginToken = useCallback(async (token, userData) => {
		if (token) {
			setAccessToken(token);
			setLoginTokenState(token);
		}
		if (userData) {
			setUser(userData);
		} else if (token) {
			try {
				const me = await getMe();
				setUser(me);
			} catch {
				// ignore
			}
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await logoutApi();
		} catch {
			// ignore
		} finally {
			clearAccessToken();
			setLoginTokenState(null);
			setUser(null);
		}
	}, []);

	const tryRefresh = useCallback(async () => {
		try {
			const newToken = await refreshToken();
			if (!newToken) {
				await logout();
				return false;
			}
			setAccessToken(newToken);
			setLoginTokenState(newToken);
			return true;
		} catch {
			await logout();
			return false;
		}
	}, [logout]);

	useEffect(() => {
		(async () => {
			const token = getAccessToken();
			if (!token) {
				setLoading(false);
				return;
			}
			try {
				const me = await getMe();
				setUser(me);
			} catch {
				const ok = await tryRefresh();
				if (ok) {
					try {
						const me2 = await getMe();
						setUser(me2);
					} catch {
						await logout();
					}
				} else {
					await logout();
				}
			} finally {
				setLoading(false);
			}
		})();
	}, [tryRefresh, logout]);

	const contextValue = useMemo(() => ({
		user,
		setUser,
		loginToken,
		setLoginToken,
		logout,
		unreadCount,
		setUnreadCount
	}), [user, loginToken, unreadCount, setLoginToken, logout]);

	if (loading) return <div>로딩 중...</div>;

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
