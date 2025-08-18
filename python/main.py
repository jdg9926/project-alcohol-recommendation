from typing import Any, Dict, Optional
import os
import httpx

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ai_client import generate_text
from wine_genai import build_wine_prompt, get_prompt_version
from gen_guard import trim_to_three_unique_blocks
from cache_store import PromptCacheStore, make_cache_key
from config import get_vertex_model
# ===== FastAPI 초기화 =====
app = FastAPI(title="Alcohol Recommendation AI API", version="1.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: 실제 서비스 시 도메인 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== 캐시 스토어 설정 =====
MYSQL_URL = os.getenv("MYSQL_URL", "")
STORE = PromptCacheStore(
    mysql_url=MYSQL_URL if MYSQL_URL else None,
    file_path="./cache/prompt_cache.json",
    mem_capacity=256,
    default_ttl_seconds=None,  # None이면 무제한 (예: 30일=2592000)
)


# ===== 데이터 모델 =====
class RecommendRequest(BaseModel):
    data: Dict[str, Any]
    force: Optional[bool] = False  # true면 캐시 무시하고 재생성


class RecommendResponse(BaseModel):
    ok: bool
    result: Optional[str] = None
    error: Optional[str] = None


# ===== 헬스체크 =====
@app.get("/health")
def health() -> Dict[str, Any]:
    """서비스 상태 확인용 엔드포인트"""
    return {"ok": True, "service": "ai", "version": "1.3.0"}


# ===== 와인 추천 =====
@app.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    AI 기반 와인 추천 엔드포인트
    - 캐시 확인
    - AI 호출
    - Bing 이미지 검색으로 이미지 보강
    - 결과 캐시 저장
    """
    try:
        model_id = get_vertex_model()
        prompt_ver = get_prompt_version()
        key = make_cache_key(req.data, model_id, prompt_ver)

        # 1) 캐시 조회
        if not req.force:
            _cached = STORE.get(key)
            if _cached:
                return RecommendResponse(ok=True, result=_cached)

        # 2) AI 호출
        prompt = build_wine_prompt(req.data)
        gen = generate_text(prompt, temperature=0.23, max_tokens=2048)
        if not gen["ok"]:
            raise HTTPException(status_code=422, detail=gen["error"] or "AI 생성 실패")

        # 3) 정제
        cleaned, _ok = trim_to_three_unique_blocks(gen["text"])
        final_txt = cleaned if cleaned else gen["text"]

        # 4) Bing 이미지 검색 → 프록시 URL 보강
        blocks = final_txt.split("\n\n")
        new_blocks = []
        for block in blocks:
            if block.strip().startswith("와인 이름:"):
                wine_name = block.replace("와인 이름:", "").strip()
                img_url = "\/static\/default_wine.png"
                if img_url:
                    if "이미지 URL" not in block:
                        block += f"\n이미지 URL: {img_url}"
                    else:
                        block = block.replace("이미지 URL:", f"이미지 URL: {img_url}")
            new_blocks.append(block)

        final_txt = "\n\n".join(new_blocks)

        # 5) 캐시에 저장
        STORE.set(key, model_id, prompt_ver, prompt, final_txt)

        return RecommendResponse(ok=True, result=final_txt)

    except HTTPException:
        raise
    except Exception as e:
        return RecommendResponse(ok=False, error=str(e))
