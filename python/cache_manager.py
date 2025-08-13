import json
import os
from pathlib import Path
from typing import Any, Optional


class FileCache:
    """
    매우 단순한 파일 캐시 (선택 사용).
    KEY를 파일명으로 저장. 실서비스는 Redis 권장.
    """
    def __init__(self, cache_dir: str = "cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        safe = key.replace("/", "_").replace("\\", "_")
        return self.cache_dir / f"{safe}.json"

    def get(self, key: str) -> Optional[Any]:
        p = self._path(key)
        if not p.exists():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return None

    def set(self, key: str, value: Any) -> None:
        p = self._path(key)
        p.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")

    def delete(self, key: str) -> None:
        p = self._path(key)
        if p.exists():
            try:
                p.unlink()
            except Exception:
                pass
