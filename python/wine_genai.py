from typing import Dict, Any, List

# 프롬프트 버전(캐시 키에 포함)
PROMPT_VERSION = "2025-08-18-3recs-v3"
def get_prompt_version() -> str:
	return PROMPT_VERSION


def _kv_line(key: str, value: str) -> str:
	v = "" if value is None else str(value).strip()
	if v in ("", "상관없음", "None", "null", "Null"):
		return ""
	return f"- {key}: {v}"


def _common_head(user_input: Dict[str, Any]) -> str:
	lines: List[str] = []
	lines.append(_kv_line("맛(키워드)", user_input.get("taste", "")))
	lines.append(_kv_line("향(키워드)", user_input.get("smell", "")))
	lines.append(_kv_line("피니시(여운)", user_input.get("finish", "")))
	lines.append(_kv_line("도수", user_input.get("alcohol_content", "")))
	lines.append(_kv_line("바디감(1~10)", user_input.get("body", "")))
	lines.append(_kv_line("당도(1~10)", user_input.get("sweetness", "")))
	lines.append(_kv_line("산미(1~10)", user_input.get("sourness", "")))
	lines.append(_kv_line("타닌(1~10)", user_input.get("tannin", "")))
	lines.append(_kv_line("가격대", user_input.get("price", "")))
	lines = [ln for ln in lines if ln]

	head = (
		"다음은 사용자 취향/조건이다. 이 조건에 가장 잘 맞는 와인 3종을 한국어로 추천하라.\n"
		"반드시 실재하는 상용 제품(정식 라벨/빈티지 존재)만 선택하고, 가상의 제품을 만들지 마라.\n"
		"국내 유통 가능성이 높은 라벨을 우선하되, 불명확한 부분은 추정하지 말고 공란으로 두어라.\n\n"
		"[사용자 조건]\n"
	)
	head += ("\n".join(lines) if lines else "- 특별한 조건 없음")

	head += (
		"\n\n[선택 가이드]\n"
		"- 키워드/수치를 우선 고려하라.\n"
		"  • 시트러스/허브/미네랄/상큼 → 소비뇽 블랑, 리슬링, 피노 그리지오 등 화이트 가중.\n"
		"  • 핵과류/플로럴/리치 → 비오니에, 게뷔르츠트라미너, 무스카.\n"
		"  • 오크/바닐라/스파이스 → 오크 숙성(샤르도네, 리오하, 보르도/나파 카베 등).\n"
		"  • 레드 과실/타닌↑/바디↑ → 카베르네 소비뇽, 시라/쉬라즈, 네비올로, 말벡.\n"
		"- 구조 수치(바디/당도/산미/타닌)는 1~10 범위 근접치 우선.\n"
		"- 도수 제시 시 ±1%p 이내 우선. 없으면 공란 허용.\n"
		"- 이미지 URL은 http/https 정적 jpg/png/webp만. 불명확하면 공란.\n"
		"\n"
		"[가격대 하드룰(한국 소매 권장)]\n"
		"- 모스카토/프로세코: 1~3만원대 / 소비뇽 블랑 NZ: 2~4만원대 / 리슬링 모젤: 2~5만원대\n"
		"- 리오하 크리안자: 3~6만원대 / 샴페인 NV: 6~12만원대 / 포트20Y: 10~20만원대\n"
		"- 소테른 일반: 5~15만원대 / 디켐: 50만원대↑ / 나파 카베: 6~20만원대↑\n"
		"→ 가격 제시가 없더라도 각 제품에 권장 가격을 반드시 기입하라(예: 2만원대, 3~5만원).\n"
		"\n"
		"[평가 루브릭(매칭률)]\n"
		"- 향/맛 일치:40%, 구조 근접:35%, 도수·피니시:10%, 예산:10%, 유통가능성:5%\n"
		"→ 60~98 사이 정수 %, 내림차순 정렬.\n"
	)
	return head


def build_wine_prompt(user_input: Dict[str, Any]) -> str:
	head = _common_head(user_input)
	body = (
		"\n[출력 형식]\n"
		"총 3개의 블록만 출력하라. 각 블록은 정확히 아래 10줄로만 구성된다. 블록 사이에는 빈 줄 1줄만 둘 것.\n"
		"와인 이름:\n"
		"품종 및 원산지:\n"
		"도수:\n"
		"맛과 향의 특징:\n"
		"추천 이유 및 어울리는 음식:\n"
		"가격:\n"
		"매칭률:\n"
		"이미지 URL:\n"
		"별점:\n"
		"평점:\n"
		"\n"
		"[형식 제약]\n"
		"- 정확히 3개의 블록만 출력하고, 그 외 텍스트는 절대 추가하지 마라.\n"
		"- 라벨/순서/구두점을 절대 바꾸지 마라. 각 줄은 '라벨: 값' 한 줄.\n"
		"- '매칭률' 뒤에는 반드시 % 기호를 붙여라. '별점'은 ★/☆ 5자, '평점'은 'x.x / 5'.\n"
		"- 마지막 블록의 '평점:' 줄을 출력한 뒤에는 아무 텍스트도 쓰지 마라.\n"
	)
	return head + "\n" + body
