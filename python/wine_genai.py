from typing import Dict, Any, List


def _kv_line(key: str, value: str) -> str:
    if not value or value == "상관없음":
        return ""
    return f"- {key}: {value}"


def build_wine_prompt(user_input: Dict[str, Any]) -> str:
    """
    프론트에서 넘어오는 폼(JSON)을 기반으로 와인 추천 프롬프트 생성.
    예시 입력:
    {
        "taste": "apple, caramel",
        "smell": "pineapple, honey, jasmine",
        "finish": "중간 정도",
        "alcohol_content": "15%",
        "body": "8",
        "sweetness": "7",
        "sourness": "4",
        "tannin": "3",
        "price": "상관없음"
    }
    """
    lines: List[str] = []

    lines.append(_kv_line("맛(키워드)", str(user_input.get("taste", ""))))
    lines.append(_kv_line("향(키워드)", str(user_input.get("smell", ""))))
    lines.append(_kv_line("피니시(여운)", str(user_input.get("finish", ""))))
    lines.append(_kv_line("도수", str(user_input.get("alcohol_content", ""))))
    lines.append(_kv_line("바디감(1~10)", str(user_input.get("body", ""))))
    lines.append(_kv_line("당도(1~10)", str(user_input.get("sweetness", ""))))
    lines.append(_kv_line("산미(1~10)", str(user_input.get("sourness", ""))))
    lines.append(_kv_line("타닌(1~10)", str(user_input.get("tannin", ""))))
    lines.append(_kv_line("가격대", str(user_input.get("price", ""))))

    # 빈 줄 제거
    lines = [ln for ln in lines if ln]

    prompt = (
        "아래 조건에 가장 어울리는 와인을 1종만 추천해 주세요.\n"
        "조건이 모호하면 한국에서 비교적 쉽게 구할 수 있는 무난하고 인기 있는 와인을 추천해 주세요.\n\n"
        "[조건]\n"
    )
    prompt += "\n".join(lines) if lines else "- 특별한 조건 없음"
    prompt += (
        "\n\n[답변 형식]\n"
        "와인 이름:\n"
        "설명(추천 이유, 어울리는 음식 등): (150자 이내, 한글)\n"
        "이미지 URL(있다면):\n"
    )
    return prompt
