// src/App.js
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// 공통 컴포넌트
import MainHeaders from "./components/Header/MainHeader";
import ErrorBoundary from "./components/Common/ErrorBoundary";

// 페이지 컴포넌트
import LoginPage from "./components/Pages/LoginPage";
import SignupPage from "./components/Pages/SignupPage";
import FindIdPage from "./components/Pages/FindIdPage";
import FindPasswordPage from "./components/Pages/FindPasswordPage";
import ResetPasswordPage from "./components/Pages/ResetPasswordPage";
import BoardPage from "./components/Board/BoardPage";
import MyPage from "./components/MyPage/MyPage";

// 와인 추천
import WineRecommendForm from "./components/Wine/WineRecommendForm";
import WineRecommendResult from "./components/Wine/WineRecommendResult";

// 라우트 가드
import RequireAuth from "./routes/RequireAuth";

// 메시지 관련 페이지
import MessageListPage from "./components/Pages/MessageListPage";
import MessageSendPage from "./components/Pages/MessageSendPage";
import MessageDetailPage from "./components/Pages/messages/MessageDetailPage";

function App() {
    const [result, setResult] = useState(null);

    // 🔧 전역 에러/리젝션 로깅 + 서버 전송
    useEffect(() => {
        const isDebug = (() => {
            try {
                const u = new URL(window.location.href);
                if (u.searchParams.get("debug") === "1") return true;
                return localStorage.getItem("DEBUG") === "1";
            } catch {
                return false;
            }
        })();

        const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL ?? "").replace(/\/$/, "");

        const sendErrorLog = (payload) => {
            try {
                fetch(`${API_BASE_URL}/api/log/error`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }).catch(() => {});
            } catch {}
        };

        const onError = (e) => {
            if (isDebug) {
                console.error("[GLOBAL][onerror]", e.message, e.error || e);
            }
            sendErrorLog({
                type: "window.onerror",
                message: e?.message,
                stack: e?.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
            });
        };

        const onUnhandledRejection = (e) => {
            if (isDebug) {
                console.error("[GLOBAL][unhandledrejection]", e.reason);
            }
            sendErrorLog({
                type: "unhandledrejection",
                message: String(e?.reason?.message || e?.reason),
                stack: e?.reason?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
            });
        };

        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onUnhandledRejection);

        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onUnhandledRejection);
        };
    }, []);

    return (
        <ErrorBoundary>
            <MainHeaders />
            <Routes>
                {/* 메인 페이지 - 와인 추천 */}
                <Route
                    path="/"
                    element={
                        result === null ? (
                            <WineRecommendForm onRecommend={setResult} />
                        ) : (
                            <WineRecommendResult
                                result={result}
                                onBack={() => setResult(null)}
                            />
                        )
                    }
                />

                {/* 인증/계정 관련 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/find-id" element={<FindIdPage />} />
                <Route path="/find-password" element={<FindPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* 게시판 */}
                <Route path="/board/*" element={<BoardPage />} />

                {/* 마이페이지 - 로그인 필요 */}
                <Route
                    path="/mypage/*"
                    element={
                        <RequireAuth>
                            <MyPage />
                        </RequireAuth>
                    }
                />

                {/* 쪽지 */}
                <Route
                    path="/messages"
                    element={
                        <RequireAuth>
                            <MessageListPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/messages/send"
                    element={
                        <RequireAuth>
                            <MessageSendPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/messages/:id"
                    element={
                        <RequireAuth>
                            <MessageDetailPage />
                        </RequireAuth>
                    }
                />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
