import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

from config import get_port, get_board_api_base
from ai_client import generate_text
from wine_genai import build_wine_prompt

# FastAPI 앱
app = FastAPI(title="Alcohol Recommendation AI API", version="1.0.0")

# CORS (프론트 React에서 호출)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 필요 시 도메인 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    # 프론트에서 넘어오는 폼 형태를 그대로 받음 (유연성 위해 Any)
    data: Dict[str, Any]


class RecommendResponse(BaseModel):
    ok: bool
    result: str
    error: str | None = None


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "service": "ai",
        "board_api_base": get_board_api_base()
    }


@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    프론트: POST http://localhost:8000/recommend
    body: { "data": { ...유저 입력... } }
    """
    prompt = build_wine_prompt(req.data)
    gen = generate_text(prompt, temperature=0.3, max_tokens=512)
    if not gen["ok"]:
        raise HTTPException(status_code=422, detail=gen["error"] or "AI 호출 실패")

    # 필요하면 여기서 Spring Boot로 결과 전달 로직 추가 가능
    # board_api_base = get_board_api_base()
    # requests.post(f"{board_api_base}/api/board/...", json=payload)

    return RecommendResponse(ok=True, result=gen["text"], error=None)


if __name__ == "__main__":
    port = get_port(8000)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
