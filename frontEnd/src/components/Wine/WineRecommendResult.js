import { useState } from "react";
import PropTypes from "prop-types";
import "./WineRecommendResult.css";

/* =========================
   ✅ 안전 이미지 컴포넌트 (프록시 경유)
   ========================= */
function ImageWithFallback({ src, alt, size = 80 }) {
  const [error, setError] = useState(false);

  // 프록시 서버를 경유한 URL
  const proxiedUrl = src
    ? `/proxy-image?url=${encodeURIComponent(src.trim())}`
    : "";

  if (!proxiedUrl || error) {
    return (
      <span role="img" aria-label="bottle" style={{ fontSize: size * 0.8 }}>
        🍾
      </span>
    );
  }

  return (
    <img
      src={proxiedUrl}
      alt={alt}
      onError={() => setError(true)}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 8,
      }}
    />
  );
}
ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
};

/* =========================
   ✅ 블록 파싱 유틸
   ========================= */
function parseSingleWineBlock(block) {
  const get = (regex) => block.match(regex)?.[1]?.trim() || "";

  const name = get(/와인 이름:\s*\*{0,2}(.+?)\*{0,2}(?:\n|$)/i);
  const origin = get(/품종 및 원산지:\s*(.+?)(?:\n|$)/i);
  const degree = get(/도수:\s*(.+?)(?:\n|$)/i);
  const description =
    [get(/맛과 향의 특징:\s*([\s\S]*?)(?:\n{2,}|\n(?=(추천 이유|가격|매칭률|이미지|별점|평점|$)))/i), get(/추천 이유 및 어울리는 음식:\s*([\s\S]*?)(?:\n|$)/i)]
      .filter(Boolean)
      .join("\n\n");
  const price = get(/가격:\s*(.+?)(?:\n|$)/i);
  const matchScore = Number(get(/매칭률:\s*(\d+)%?/i)) || 0;
  const rawImg = get(/이미지\s*URL.*?:\s*(.*?)(?:\s|\n|$)/i);
  const starsText = get(/별점:\s*([★☆]+)/i);
  const ratingText = get(/평점:\s*([\d.]+)\s*\/\s*([\d.]+)/i);

  const stars = (starsText.match(/★/g) || []).length;
  const rating = ratingText ? parseFloat(ratingText) : stars || 0;

  const image =
    /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(rawImg) ? rawImg : "";

  return { name, origin, degree, description, price, match: matchScore, stars, rating, image };
}

function parseWineResults(result) {
  if (!result || typeof result !== "string") return [];
  const blocks = result.match(/와인 이름:\s[\s\S]*?(?=(?:\n와인 이름:|$))/g) || [];

  const wines = [];
  const seen = new Set();

  for (const block of blocks) {
    const w = parseSingleWineBlock(block);
    if (!w.name) continue;

    const key = `${w.name}|${w.origin}|${w.degree}`.toLowerCase().replace(/\s+/g, "");
    if (seen.has(key)) continue;

    seen.add(key);
    wines.push(w);
    if (wines.length >= 3) break;
  }

  return wines.sort((a, b) => b.match - a.match).slice(0, 3);
}

/* =========================
   ✅ 별점 렌더링
   ========================= */
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
StarRating.propTypes = { score: PropTypes.number.isRequired };

/* =========================
   ✅ 카드
   ========================= */
function WineCard({ wine, onBuy, onDetail }) {
  return (
    <div className="wine-card">
      <div className="wine-image">
        <ImageWithFallback src={wine.image} alt={wine.name} />
      </div>
      <div className="wine-info">
        <div className="match-score">⭐ {wine.match}% 매칭</div>
        <div className="wine-name">{wine.name}</div>
        <div className="wine-origin">{wine.origin}</div>
        {wine.degree && <div className="wine-degree">도수: {wine.degree}</div>}
        <div className="wine-description">{wine.description}</div>

        <div className="wine-details">
          <div className="price">{wine.price}</div>
          <div className="rating">
            <StarRating score={wine.stars} />
            <span>{wine.rating}/5</span>
          </div>
        </div>

        <div className="btn-container">
          <button className="btn btn-primary" onClick={() => onBuy(wine.name)}>구매하기</button>
          <button className="btn btn-secondary" onClick={() => onDetail(wine.name)}>상세보기</button>
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

/* =========================
   ✅ 메인 컴포넌트
   ========================= */
export default function WineRecommendResult({ result, onBack }) {
  const wines = parseWineResults(result);

  const handleBuy = (wineName) => alert(`${wineName} 구매 페이지로 이동합니다!`);
  const handleDetail = (wineName) => alert(`${wineName} 상세 정보를 확인합니다!`);

  return (
    <div className="container">
      <div
        className="recommendations"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {wines.map((wine, idx) => (
          <WineCard
            key={`${wine.name}-${idx}`}
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
WineRecommendResult.propTypes = { result: PropTypes.string.isRequired, onBack: PropTypes.func };
