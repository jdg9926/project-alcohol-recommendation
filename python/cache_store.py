import os
import json
import time
import hashlib
import logging
from collections import OrderedDict
from typing import Any, Dict, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from dotenv import load_dotenv

# -------------------
# 환경 설정
# -------------------
load_dotenv()
MYSQL_URL = os.getenv("MYSQL_URL")

# 로깅 세팅
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PromptCache")


def make_cache_key(payload: Dict[str, Any], model_id: str, prompt_version: str) -> str:
    """
    입력 JSON + 모델ID + 프롬프트버전 → SHA-256 해시 키 생성
    """
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    raw = f"{canonical}|{model_id}|{prompt_version}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# -------------------
# Memory LRU
# -------------------
class MemoryLRU:
    def __init__(self, capacity: int = 256):
        self.capacity = capacity
        self.data: "OrderedDict[str, Tuple[float, str]]" = OrderedDict()

    def get(self, key: str) -> Optional[str]:
        if key not in self.data:
            return None
        ts, val = self.data.pop(key)
        self.data[key] = (ts, val)  # move to end (recent)
        return val

    def set(self, key: str, value: str) -> None:
        if key in self.data:
            self.data.pop(key, None)
        self.data[key] = (time.time(), value)
        while len(self.data) > self.capacity:
            self.data.popitem(last=False)


# -------------------
# File Cache
# -------------------
class FileCache:
    def __init__(self, path: str = "./cache/prompt_cache.json"):
        self.path = path
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                json.dump({}, f, ensure_ascii=False)

    def _read_all(self) -> Dict[str, Any]:
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_all(self, obj: Dict[str, Any]) -> None:
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False)
        os.replace(tmp, self.path)

    def get(self, key: str, ttl_seconds: Optional[int] = None) -> Optional[str]:
        data = self._read_all()
        item = data.get(key)
        if not item:
            return None
        ts = item.get("ts", 0)
        if ttl_seconds and (time.time() - ts) > ttl_seconds:
            return None
        return item.get("val")

    def set(self, key: str, value: str) -> None:
        data = self._read_all()
        data[key] = {"ts": time.time(), "val": value}
        self._write_all(data)


# -------------------
# MySQL Cache
# -------------------
class MySQLCache:
    def __init__(self, url: str):
        self.engine: Engine = create_engine(url, pool_pre_ping=True, pool_recycle=3600)
        self._ensure_table()

    def _ensure_table(self) -> None:
        ddl = """
        CREATE TABLE IF NOT EXISTS ai_prompt_cache (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            cache_key VARCHAR(191) NOT NULL UNIQUE,
            model_id VARCHAR(191) NOT NULL,
            prompt_version VARCHAR(64) NOT NULL,
            prompt LONGTEXT NULL,
            response LONGTEXT NULL,
            hits INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """
        with self.engine.begin() as conn:
            conn.execute(text(ddl))

    def get(self, key: str, ttl_seconds: Optional[int] = None) -> Optional[str]:
        sql = "SELECT response, UNIX_TIMESTAMP(updated_at) AS uts FROM ai_prompt_cache WHERE cache_key=:k"
        with self.engine.begin() as conn:
            row = conn.execute(text(sql), {"k": key}).fetchone()
        if not row:
            return None
        resp, uts = row[0], int(row[1])
        if ttl_seconds and (time.time() - uts) > ttl_seconds:
            return None
        # hits++
        with self.engine.begin() as conn:
            conn.execute(text("UPDATE ai_prompt_cache SET hits=hits+1 WHERE cache_key=:k"), {"k": key})
        return resp

    def set(self, key: str, model_id: str, prompt_version: str, prompt: str, response: str) -> None:
        upsert = """
        INSERT INTO ai_prompt_cache (cache_key, model_id, prompt_version, prompt, response, hits)
        VALUES (:k, :m, :v, :p, :r, 1)
        ON DUPLICATE KEY UPDATE
            model_id=VALUES(model_id),
            prompt_version=VALUES(prompt_version),
            prompt=VALUES(prompt),
            response=VALUES(response),
            hits=hits+1;
        """
        with self.engine.begin() as conn:
            conn.execute(text(upsert), {"k": key, "m": model_id, "v": prompt_version, "p": prompt, "r": response})


# -------------------
# Unified Cache Store
# -------------------
class PromptCacheStore:
    def __init__(
        self,
        mysql_url: Optional[str] = MYSQL_URL,
        file_path: str = "./cache/prompt_cache.json",
        mem_capacity: int = 256,
        default_ttl_seconds: Optional[int] = None,
    ):
        self.mem = MemoryLRU(mem_capacity)
        self.file = FileCache(file_path)
        self.db = MySQLCache(mysql_url) if mysql_url else None
        self.default_ttl_seconds = default_ttl_seconds

    def get(self, key: str, ttl_seconds: Optional[int] = None) -> Optional[str]:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl_seconds

        # 1) Memory
        val = self.mem.get(key)
        if val:
            logger.info(f"Cache HIT: Memory ({key})")
            return val

        # 2) MySQL
        if self.db:
            val = self.db.get(key, ttl)
            if val:
                logger.info(f"Cache HIT: MySQL ({key})")
                self.mem.set(key, val)
                self.file.set(key, val)
                return val

        # 3) File
        val = self.file.get(key, ttl)
        if val:
            logger.info(f"Cache HIT: File ({key})")
            self.mem.set(key, val)
            return val

        logger.info(f"Cache MISS ({key})")
        return None

    def set(self, key: str, model_id: str, prompt_version: str, prompt: str, response: str) -> None:
        self.mem.set(key, response)
        self.file.set(key, response)
        if self.db:
            self.db.set(key, model_id, prompt_version, prompt, response)
        logger.info(f"Cache SET ({key})")
