from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from wine_genai import recommend_wine_by_conditions

# 👇 게시판 등록용 requests 추가
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://3.36.66.231:3000",
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
    API_URL = "http://3.36.66.231:8888/api/board/write"
    post_data = {
        "title": title,
        "content": content,
        "author": author
    }
    try:
        response = requests.post(API_URL, json=post_data, timeout=5)
        if response.ok:
            print("게시판 등록 성공!")
        else:
            print("게시판 등록 실패:", response.status_code, response.text)
    except Exception as e:
        print("게시판 등록 예외:", e)

def extract_wine_name(recommendation_text):
    # "와인 이름:" 줄만 탐색, 거기에만 이름이 있으면 그걸 쓴다
    for line in recommendation_text.splitlines():
        if "와인 이름:" in line:
            # "와인 이름: 빌라 마리아 소비뇽 블랑 말보로 (영문명)" 같은 형태도 대응
            wine_name = line.split("와인 이름:")[1].strip()
            # 괄호 이전까지를 쓰고 싶으면 아래 주석 해제
            # return wine_name.split("(")[0].strip() if "(" in wine_name else wine_name
            return wine_name
    return "추천 와인"  # 없으면 기본값

@app.post("/recommend")
async def recommend(data: WineRequest):
    conditions = data.model_dump()
    recommendation = recommend_wine_by_conditions(conditions)  # 이미 예쁘게 정렬됨!

    wine_name = extract_wine_name(recommendation)
    title = f"AI 와인 추천: {wine_name}"
    content = recommendation  # "가공 없이 그대로" 저장!

    post_to_board(title, content)
    return {"recommendation": recommendation}
