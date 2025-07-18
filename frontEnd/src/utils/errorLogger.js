// utils/errorLogger.js

/**
 * 게시판에 SYSTEM 에러 로그 남기는 함수 (API 경로, 사용자 정보, 추가 데이터 확장 지원)
 * @param {Object} options
 * @param {string} options.BASE_URL - API 베이스 URL (콜론, 포트 포함)
 * @param {string} options.title - 에러 요약(상태코드, 상태텍스트 등)
 * @param {string} options.errorDetail - 에러 상세 내용 (json, text 등)
 * @param {string} options.originTitle - 사용자가 원래 입력한 제목
 * @param {number} options.contentLength - 내용 길이(선택)
 * @param {string} options.apiPath - 에러난 API 엔드포인트 (예: "/api/board/write")
 * @param {Object} [options.userInfo] - 사용자 정보(예: {id, email, nickname 등})
 * @param {Object} [options.extraData] - 추가 데이터(선택, 어떤 데이터든)
 */
export async function logErrorToBoard({ BASE_URL, title, errorDetail, originTitle, contentLength, apiPath, userInfo, extraData }) {
    // 내용 문자열 구성
    let contentMsg = `
        에러 발생 시각: ${new Date().toLocaleString()}
        에러 발생 API: ${apiPath || "-"}
        입력 제목: ${originTitle}
        입력 내용 길이: ${contentLength}
    `;

    if (userInfo) {
        contentMsg += `\n[사용자 정보]\n`;
        Object.entries(userInfo).forEach(([key, val]) => {
            contentMsg += `${key}: ${val}\n`;
        });
    }

    if (extraData) {
        contentMsg += `\n[추가 데이터]\n`;
        Object.entries(extraData).forEach(([key, val]) => {
            contentMsg += `${key}: ${JSON.stringify(val)}\n`;
        });
    }

    contentMsg += `\n에러 상세: ${errorDetail}`;

    try {
        await fetch(`${BASE_URL}:8888/api/board/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: `[ERROR] 게시글 등록 실패 ${title}`,
                content: contentMsg,
                author: "SYSTEM"
            })
        });
    } catch (logErr) {
        console.error("에러 로그도 등록 실패:", logErr);
    }
}
