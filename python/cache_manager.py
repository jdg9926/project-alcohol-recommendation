import json
import os
import time

class CacheManager:
    CACHE_DIR = "cache"
    CACHE_FILE = os.path.join(CACHE_DIR, "cache_data.json")
    CACHE_EXPIRATION_SECONDS = 60 * 60 * 24 * 365  # 1년

    def __init__(self):
        self.cache = {}
        self.ensure_cache_dir()
        self.load_cache()
        self.cleanup_cache()

    def ensure_cache_dir(self):
        os.makedirs(self.CACHE_DIR, exist_ok=True)

    def load_cache(self):
        try:
            if os.path.exists(self.CACHE_FILE):
                with open(self.CACHE_FILE, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
        except Exception as e:
            print(f"[ERROR] 캐시 로딩 실패: {e}")
            self.cache = {}

    def save_cache(self):
        try:
            with open(self.CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[ERROR] 캐시 저장 실패: {e}")

    def is_cache_valid(self, entry):
        return (time.time() - entry["timestamp"]) < self.CACHE_EXPIRATION_SECONDS

    def cleanup_cache(self):
        now = time.time()
        expired_keys = [k for k, v in self.cache.items() if (now - v["timestamp"]) > self.CACHE_EXPIRATION_SECONDS]
        for k in expired_keys:
            del self.cache[k]
        if expired_keys:
            print(f"[INFO] 만료된 캐시 {len(expired_keys)}개 삭제됨.")

    def get_cached_response(self, prompt):
        if prompt in self.cache and self.is_cache_valid(self.cache[prompt]):
            print("[캐시에서 답변 사용]")
            return self.cache[prompt]["response"]
        return None

    def set_cached_response(self, prompt, response):
        self.cache[prompt] = {"response": response, "timestamp": time.time()}
        self.save_cache()
