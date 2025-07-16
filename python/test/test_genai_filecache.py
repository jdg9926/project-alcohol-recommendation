import json
import os
from google.genai import client

CACHE_FILE = "cache_data.json"

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

cache = load_cache()

def ask_ai(genai_client, prompt):
    if prompt in cache:
        print("[캐시에서 답변 사용]")
        return cache[prompt]

    response = genai_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    cache[prompt] = response.text
    save_cache(cache)
    return response.text

def main():
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
