import PropTypes from "prop-types";
import "./WineRecommendResult.css";

// result(텍스트)를 wine 객체로 파싱하는 함수
function parseWineResult(result) {
    // 항목별로 정규식 추출
    const nameMatch = result?.match(/와인 이름:\s*\*{0,2}(.+?)\*{0,2}\n/i);
    const originMatch = result?.match(/품종 및 원산지:\s*(.+)\n/i);
    const degreeMatch = result?.match(/도수:\s*(.+)\n/i);
    const descriptionMatch = result?.match(/맛과 향의 특징:\s*([\s\S]*?)\n\n/i)
        || result?.match(/맛과 향의 특징:\s*([\s\S]*?)\n/i);
    const priceMatch = result?.match(/가격:\s*(.+)\n/i);
    const matchScoreMatch = result?.match(/[*]*매칭률:[*\s]*(\d+)%/i);
    const reasonMatch = result?.match(/추천 이유 및 어울리는 음식:\s*([\s\S]*?)\n/i);
    const imageUrlMatch = result?.match(/이미지\s*URL.*?:\s*(.*?)(?:\n|$)/i);
    const starsMatch = result?.match(/[*]*별점:[*\s]*([★☆]+)/i);
    const ratingMatch = result?.match(/[*]*평점:[*\s]*([\d.]+)\s*\/\s*([\d.]+)/i);

    // 별점 갯수 세기 (★ 1개당 1점)
    let stars = 0;
    if (starsMatch?.[1]) {
        stars = (starsMatch[1].match(/★/g) || []).length;
    }

    // 평점(실수) 추출
    let rating = 0;
    if (ratingMatch?.[1]) {
        rating = parseFloat(ratingMatch[1]);
    }

    return {
        match: matchScoreMatch?.[1] ? Number(matchScoreMatch[1]) : 0,
        name: nameMatch?.[1]?.trim() || "",
        origin: originMatch?.[1]?.trim() || "",
        degree: degreeMatch?.[1]?.trim() || "",
        description: [
            (descriptionMatch?.[1]?.trim() || ""),
            (reasonMatch?.[1]?.trim() || "")
        ].filter(Boolean).join("\n\n"),
        price: priceMatch?.[1]?.trim() || "",
        rating: rating,
        stars: stars,
        image: imageUrlMatch?.[1]?.trim() || "",
    };
}

// 별점(★) 렌더링 유틸
function StarRating({ score }) {
    const full = Math.floor(score);
    const half = score % 1 >= 0.5;
    return (
        <span className="stars">
            {"★".repeat(full)}
            {half ? "☆" : ""}
            {"☆".repeat(5 - full - (half ? 1 : 0))}
        </span>
    );
}
StarRating.propTypes = {
    score: PropTypes.number.isRequired,
};

function WineCard({ wine, onBuy, onDetail }) {
    return (
        <div className="wine-card">
            <div className="wine-image">
                {/* wine.image ||  <img src={wine.image} alt={wine.name} style={{width: 80, borderRadius: 8}} /> */}
                {"🍾"}
            </div>
            <div className="wine-info">
                <div className="match-score">⭐ {wine?.match} 매칭</div>
                <div className="wine-name">{wine?.name}</div>
                <div className="wine-origin">{wine?.origin}</div>
                {/* 도수 UI 추가! */}
                {wine?.degree && (
                    <div className="wine-degree">도수: {wine.degree}</div>
                )}
                <div className="wine-description">{wine?.description}</div>
                <div className="wine-details">
                    <div className="price">
                        {wine?.price}
                    </div>
                    <div className="rating">
                        <StarRating score={wine?.stars} />
                        <span>{wine?.rating}/5</span>
                    </div>
                </div>
                <div className="btn-container">
                    <button
                        className="btn btn-primary"
                        onClick={() => onBuy(wine?.name)}
                    >
                        구매하기
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => onDetail(wine?.name)}
                    >
                        상세보기
                    </button>
                </div>
            </div>
        </div>
    );
}
WineCard.propTypes = {
    wine: PropTypes.shape({
        match: PropTypes.number,
        name: PropTypes.string,
        origin: PropTypes.string,
        degree: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.string,
        stars: PropTypes.number,
        rating: PropTypes.number,
        image: PropTypes.string,
    }).isRequired,
    onBuy: PropTypes.func.isRequired,
    onDetail: PropTypes.func.isRequired,
};

export default function WineRecommendResult({ result, onBack }) {
    // result(문자열)를 wine 객체로 변환!
    const wine = parseWineResult(result);
    const wineData = [wine];

    const handleBuy = (wineName) => {
        alert(`${wineName} 구매 페이지로 이동합니다!`);
    };
    const handleDetail = (wineName) => {
        alert(`${wineName} 상세 정보를 확인합니다!`);
    };

    return (
        <div className="container">
            <div className="recommendations">
                {wineData.map((wine) => (
                    <WineCard
                        key={wine?.name}
                        wine={wine}
                        onBuy={handleBuy}
                        onDetail={handleDetail}
                    />
                ))}
            </div>
            {onBack && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <button className="btn btn-secondary" onClick={onBack}>
                        ◀ 뒤로가기
                    </button>
                </div>
            )}
        </div>
    );
}
WineRecommendResult.propTypes = {
    result: PropTypes.string.isRequired,
    onBack: PropTypes.func,
};
