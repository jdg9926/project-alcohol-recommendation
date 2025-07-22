from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from wine_genai import recommend_wine_by_conditions
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://43.200.182.46:3000",
        "http://project-alcohol-recommendation.s3-website.ap-northeast-2.amazonaws.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WineRequest(BaseModel):
    taste: str = "풍부하고 진한"
    smell: str = "과일 향이 풍부한"
    finish: str = "긴 편"
    alcohol_content: str = "13%"
    body: str = "중간"
    tannin: str = "중간"
    sweetness: str = "약간 달콤한"
    sourness: str = "적당히 시큼한"
    price: str = "상관없음"

def post_to_board(title, content, author="AI"):
    API_URL = "http://43.200.182.46:8888/api/board/write"
    files = {
        "title": (None, title),
        "content": (None, content),
        "author": (None, author)
    }
    try:
        response = requests.post(API_URL, files=files, timeout=5)
        print("Content-Type:", response.request.headers.get('Content-Type'))
        if response.ok:
            print("게시판 등록 성공!")
        else:
            print("게시판 등록 실패:", response.status_code, response.text)
    except Exception as e:
        print("게시판 등록 예외:", e)

def extract_wine_name(recommendation_text):
    for line in recommendation_text.splitlines():
        if "와인 이름:" in line:
            wine_name = line.split("와인 이름:")[1].strip()
            return wine_name
    return "추천 와인"

@app.post("/recommend")
async def recommend(data: WineRequest):
    conditions = data.model_dump()
    recommendation = recommend_wine_by_conditions(conditions)
    wine_name = extract_wine_name(recommendation)
    title = f"AI 와인 추천: {wine_name}"
    content = recommendation

    post_to_board(title, content)
    return {"recommendation": recommendation}
