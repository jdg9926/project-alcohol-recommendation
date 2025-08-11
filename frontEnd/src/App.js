import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// 공통 컴포넌트
import MainHeaders from "./components/Header/MainHeader";

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

    return (
        <>
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

                <Route path="/messages" element={<MessageListPage />} />
                <Route path="/messages/send" element={<MessageSendPage />} />
                <Route path="/messages/:id" element={<MessageDetailPage />} />
            </Routes>
        </>
    );
}

export default App;
