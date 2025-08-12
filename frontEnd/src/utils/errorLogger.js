export async function logErrorToBoard({ BASE_URL, title, errorDetail, originTitle, apiPath, userInfo, extraData, loginToken, isRetry }) {
    let contentMsg = `
에러 발생 시각: ${new Date().toLocaleString()}
에러 발생 API: ${apiPath || "-"}
입력 제목: ${originTitle ?? "-"}
`;
    if (userInfo) {
        contentMsg += `[사용자 정보]\n`;
        Object.entries(userInfo).forEach(([key, val]) => {
            contentMsg += `${key}: ${val}\n`;
        });
    }
    if (extraData) {
        contentMsg += `[추가 데이터]\n`;
        Object.entries(extraData).forEach(([key, val]) => {
            contentMsg += `${key}: ${JSON.stringify(val)}\n`;
        });
    }
    contentMsg += `에러 상세: ${errorDetail}`;

    const formData = {
        title: `[ERROR] ${isRetry ? "(2차)" : ""} ${title} 실패`,
        content: contentMsg,
        author: "SYSTEM",
        boardType: "ERROR"
    };

    try {
        // 👉 최대 2번까지만 시도(무한루프 방지, 2차 등록에도 실패하면 그 뒤는 로그만)
        await fetch(`${BASE_URL}/api/board/errLog`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(loginToken && { "Authorization": `Bearer ${loginToken}` })
            },
            body: JSON.stringify(formData),
        });
    } catch (logErr) {
        if (!isRetry) {
            // 1회 시도에 실패했다면 한 번만 더 2차 자동등록 시도
            await logErrorToBoard({
                BASE_URL,
                title: "에러게시판 등록 자체 실패",
                errorDetail: logErr.message,
                originTitle: title,
                apiPath: "/api/board/write",
                userInfo,
                extraData: { ...extraData, originalError: errorDetail },
                loginToken,
                isRetry: true
            });
        } else {
            // 2회차에도 실패하면 더 이상 재귀 호출하지 않음
            console.error("에러게시판 재등록까지 실패:", logErr);
        }
    }
}