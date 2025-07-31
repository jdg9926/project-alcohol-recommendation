import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import MainHeaders from "./components/Header/MainHeader";
import LoginPage from "./components/Pages/LoginPage.js";
import SignupPage from "./components/Pages/SignupPage";
import FindIdPage from './components/Pages/FindIdPage';
import FindPasswordPage from './components/Pages/FindPasswordPage';
import ResetPasswordPage from './components/Pages/ResetPasswordPage';
import WineRecommendForm from "./components/Wine/WineRecommendForm";
import WineRecommendResult from "./components/Wine/WineRecommendResult";
import BoardPage from './components/Board/BoardPage';

import MyPage from "./components/MyPage/MyPage.js";

function App() {
    const [result, setResult] = useState(null);
    return (
        <>
            <MainHeaders />
            <Routes>
                <Route
                    path="/"
                    element={
                        result == null ? (
                            <WineRecommendForm onRecommend={setResult} />
                        ) : (
                            <WineRecommendResult result={result} onBack={() => setResult(null)} />
                        )
                    }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/find-id" element={<FindIdPage />} />
                <Route path="/find-password" element={<FindPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/board/*" element={<BoardPage />} />

                <Route path="/mypage/*" element={<MyPage />} />
            </Routes>
        </>
    );
}

export default App;
