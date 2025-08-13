// src/components/common/ErrorBoundary.jsx
import { Component } from "react";

// 디버그 모드 체크
const isDebug = (() => {
    try {
        const u = new URL(window.location.href);
        if (u.searchParams.get("debug") === "1") return true;
        return localStorage.getItem("DEBUG") === "1";
    } catch { return false; }
})();

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL ?? "").replace(/\/$/, "");

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // 콘솔 로그
        console.error("[ErrorBoundary][caught]", error, errorInfo);

        // 서버 로그 전송 (옵션)
        sendErrorLog({
            message: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack || "",
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });

        // 상태 저장
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (isDebug) {
                // 디버그 모드일 때는 상세 출력
                return (
                    <div style={{ padding: "20px", background: "#fee", color: "#900" }}>
                        <h2>💥 렌더링 중 오류가 발생했습니다 (Debug Mode)</h2>
                        <p><strong>{this.state.error?.message}</strong></p>
                        {this.state.error?.stack && (
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9em", background: "#fdd", padding: "10px" }}>
                                {this.state.error.stack}
                            </pre>
                        )}
                        {this.state.errorInfo?.componentStack && (
                            <details style={{ marginTop: "1em" }}>
                                <summary>React Component Stack</summary>
                                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9em" }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        <button onClick={() => window.location.reload()}>페이지 새로고침</button>
                    </div>
                );
            }
            // 일반 모드: 심플 UI
            return (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <h2>오류가 발생했습니다.</h2>
                    <p>잠시 후 다시 시도해주세요.</p>
                    <button onClick={() => window.location.reload()}>새로고침</button>
                </div>
            );
        }
        return this.props.children;
    }
}

/** 서버로 에러 로그 전송 */
function sendErrorLog(payload) {
    try {
        const url = `${API_BASE_URL}/api/log/error`; // ✅ 절대경로로 백엔드로 보냄
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // credentials 필요X (permitAll + 쿠키 안 씀)
            body: JSON.stringify(payload),
        }).catch((err) => {
            console.warn("[ErrorBoundary][sendErrorLog fail]", err);
        });
    } catch (err) {
        console.warn("[ErrorBoundary][sendErrorLog exception]", err);
    }
}