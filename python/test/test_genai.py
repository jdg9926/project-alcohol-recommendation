import json
import os
import time
from google.genai import client

import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\admin\Desktop\python\qna-ai-proejct-5fd3a30365dd.json"

# 캐시 폴더 및 파일 경로 지정
CACHE_DIR = "cache"
CACHE_FILE = os.path.join(CACHE_DIR, "cache_data.json")



# 캐시 만료 시간: 1년 (초 단위)
CACHE_EXPIRATION_SECONDS = 60 * 60 * 24 * 365

def ensure_cache_dir():
    os.makedirs(CACHE_DIR, exist_ok=True)

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            raw_cache = json.load(f)
            new_cache = {}
            for k, v in raw_cache.items():
                if isinstance(v, str):
                    new_cache[k] = {
                        "response": v,
                        "timestamp": 0
                    }
                else:
                    new_cache[k] = v
            return new_cache
    return {}

def save_cache(cache):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def is_cache_valid(entry):
    return (time.time() - entry["timestamp"]) < CACHE_EXPIRATION_SECONDS

cache = {}

def ask_ai(genai_client, prompt):
    if prompt in cache and is_cache_valid(cache[prompt]):
        print("[캐시에서 답변 사용]")
        return cache[prompt]["response"]

    response = genai_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    cache[prompt] = {
        "response": response.text,
        "timestamp": time.time()
    }
    save_cache(cache)
    return response.text

def main():
    ensure_cache_dir()  # 캐시 폴더 존재 확인 및 생성
    global cache
    cache = load_cache()

    genai_client = client.Client(
        vertexai=True,
        project="qna-ai-proejct",
        location="us-central1"
    )

    prompts = [
        "AI가 어떻게 작동하는지 간단히 설명해줘.",
        "AI가 어떻게 작동하는지 간단히 설명해줘.",
        "인공지능의 장점은 뭐야?"
    ]

    for p in prompts:
        answer = ask_ai(genai_client, p)
        print(f"질문: {p}")
        print(f"답변: {answer}\n")

if __name__ == "__main__":
    main()
