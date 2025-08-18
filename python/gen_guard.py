import re
from typing import List, Tuple

EXPECTED_LABELS = [
	"와인 이름", "품종 및 원산지", "도수", "맛과 향의 특징",
	"추천 이유 및 어울리는 음식", "가격", "매칭률",
	"이미지 URL", "별점", "평점"
]

_BLOCK_SPLIT = re.compile(r"(?:^|\n)(와인 이름:\s[\s\S]*?)(?=(?:\n와인 이름:\s)|\Z)", re.MULTILINE)

def split_blocks(text: str) -> List[str]:
	if not text:
		return []
	return [m.group(1).strip() for m in _BLOCK_SPLIT.finditer(text)]

def block_has_all_labels(block: str) -> bool:
	for label in EXPECTED_LABELS:
		if re.search(rf"^{label}:\s*", block, flags=re.IGNORECASE | re.MULTILINE) is None:
			return False
	return True

def _normalize_name(block: str) -> str:
	m = re.search(r"와인 이름:\s*(.+)", block)
	if not m:
		return ""
	import re as _re
	name = m.group(1).strip()
	return _re.sub(r"[\s,·\-\(\)\[\]{}'\"/]+", "", name).lower()

def _fix_percent(block: str) -> str:
	def _repl(m):
		val = m.group(1)
		suffix = m.group(2) or ""
		return val + "%" if "%" not in suffix else m.group(0)
	return re.sub(r"(매칭률:\s*\d+)(\s*%?)", _repl, block)

def trim_to_three_unique_blocks(text: str) -> Tuple[str, bool]:
	blocks = split_blocks(text)
	out: List[str] = []
	seen = set()
	for b in blocks:
		if not block_has_all_labels(b):
			continue
		b = _fix_percent(b)
		key = _normalize_name(b)
		if key and key not in seen:
			out.append(b.strip())
			seen.add(key)
		if len(out) == 3:
			break
	return ("\n\n".join(out), len(out) == 3)
