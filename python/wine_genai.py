from vertexai.generative_models import GenerativeModel
import vertexai
from cache_manager import CacheManager

cache_manager = CacheManager()

def create_prompt(**kwargs):
    info = [f"- {key}: {value}" for key, value in kwargs.items() if value and value != "상관없음"]
    prompt = (
        "당신은 세계적으로 인정받는 전문 소믈리에이면서 와인 평론가입니다. "
        "아래 사용자가 제시한 조건을 바탕으로 가장 잘 어울리는 와인 1종을 상세히 추천해주세요.\n"
        "조건이 명확하지 않을 경우, 한국에서 쉽게 구할 수 있는 대중적이고 인기가 많은 와인을 추천해주세요.\n\n"
        "[사용자가 요청한 조건]\n"
    )
    prompt += "\n".join(info) if info else "- 특별한 조건 없음"
    prompt += (
        "\n\n[답변 형식]\n"
        "와인 이름:\n\n"
        "품종 및 원산지:\n\n"
        "도수:\n\n"
        "맛과 향의 특징:\n\n"
        "가격:\n\n"
        "매칭률:\n\n"
        "별점:\n\n"
        "평점:\n\n"
        "추천 이유 및 어울리는 음식(150자 이내, 한글):\n\n"
        "이미지 URL(병 라벨이나 와인 이미지):\n\n"
        "(항목마다 반드시 줄바꿈을 넣어 출력)\n"
    )
    return prompt

def extract_text_from_response(response):
    try:
        if hasattr(response, "candidates"):
            candidates = response.candidates
            if candidates:
                content = candidates[0].content
                parts = getattr(content, "parts", [])
                if parts and hasattr(parts[0], "text"):
                    return parts[0].text.strip()
        return str(response).strip()
    except Exception as e:
        print(f"[ERROR] 결과 파싱 실패: {e}")
        return "추천 결과를 불러올 수 없습니다."

def recommend_wine_by_conditions(conditions, use_cache=True):
    prompt = create_prompt(**conditions)
    if use_cache:
        cached = cache_manager.get_cached_response(prompt)
        if cached:
            return cached

    try:
        vertexai.init(project="qna-ai-proejct", location="us-central1")
        model = GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()

        if use_cache:
            cache_manager.set_cached_response(prompt, text)

        print("[AI로부터 새 답변 생성]")
        return text

    except Exception as e:
        print(f"[ERROR] AI 호출 실패: {e}")
        return "AI 서비스에 문제가 발생했습니다."

# CLI 테스트용
def input_with_default(prompt, default):
    return input(f"{prompt} (기본값: {default}): ").strip() or default

def input_rating_or_text(prompt, default):
    while True:
        user_input = input(f"{prompt} (1~10 숫자 또는 설명, 기본값: {default}): ").strip()
        if not user_input:
            return default
        if user_input.isdigit() and 1 <= int(user_input) <= 10:
            return user_input
        print("1부터 10 사이 숫자 또는 설명을 입력하세요.")

def main():
    conditions = {
        "맛": input_with_default("맛은?", "풍부하고 진한"),
        "향": input_with_default("향은?", "과일 향이 풍부한"),
        "여운": input_with_default("여운은?", "긴 편"),
        "도수": input_with_default("도수는?", "13%"),
        "바디": input_rating_or_text("바디", "중간"),
        "타닌": input_rating_or_text("타닌", "중간"),
        "당도": input_rating_or_text("당도", "약간 달콤한"),
        "산미": input_rating_or_text("산미", "적당히 시큼한"),
        "가격": input_with_default("가격은?", "상관없음")
    }

    recommendation = recommend_wine_by_conditions(conditions)
    print("\n[와인 추천 결과]")
    print(recommendation)

if __name__ == "__main__":
    main()
