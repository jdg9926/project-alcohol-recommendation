import os
import traceback
from typing import Dict, Any, Optional

import vertexai
from vertexai.generative_models import GenerativeModel

from config import (
    get_google_credentials_path,
    get_vertex_project_id,
    get_vertex_location,
    get_vertex_model,
)
from cache_store import MySQLCache  # DB 로깅 위해 추가

# ===== Vertex AI 초기화 =====
_ = get_google_credentials_path()
_PROJECT_ID = get_vertex_project_id()
_LOCATION = get_vertex_location()
_MODEL_ID = get_vertex_model()

# 전역 모델 / DB 캐시 객체
_vertex_model: Optional[GenerativeModel] = None
_mysql_cache: Optional[MySQLCache] = None


def get_model() -> GenerativeModel:
    """Vertex AI GenerativeModel 인스턴스 반환"""
    global _vertex_model
    if _vertex_model is None:
        vertexai.init(project=_PROJECT_ID, location=_LOCATION)
        _vertex_model = GenerativeModel(_MODEL_ID)
    return _vertex_model


def get_mysql_cache() -> Optional[MySQLCache]:
    """MySQLCache 인스턴스 반환 (환경변수 MYSQL_URL 기반)"""
    global _mysql_cache
    if _mysql_cache is None:
        mysql_url = os.getenv("MYSQL_URL")
        if mysql_url:
            _mysql_cache = MySQLCache(mysql_url)
    return _mysql_cache


def _log_to_file(prompt: str, result: str, error: Optional[str] = None) -> None:
    """AI 호출 로그를 파일에 저장"""
    os.makedirs("logs", exist_ok=True)
    log_path = os.path.join("logs", "ai_calls.log")
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("==== AI CALL ====\n")
            f.write(f"MODEL: {_MODEL_ID}\n")
            f.write(f"PROMPT: {prompt[:300]}...\n")
            if error:
                f.write(f"ERROR: {error}\n")
            else:
                f.write(f"RESULT: {result[:300]}...\n")
            f.write("\n")
    except Exception:
        pass  # 로그 기록 실패는 무시


def _log_to_mysql(prompt: str, result: str, error: Optional[str] = None) -> None:
    """AI 호출 로그를 MySQL ai_prompt_cache 테이블에 저장"""
    cache = get_mysql_cache()
    if not cache:
        return
    try:
        response = error if error else result
        cache.set(
            key=f"ai_log_{os.urandom(6).hex()}",
            model_id=_MODEL_ID,
            prompt_version="ai_client_log",
            prompt=prompt,
            response=response,
        )
    except Exception:
        pass  # DB 에러도 무시 (서비스 중단 방지)


def generate_text(
    prompt: str,
    temperature: float = 0.23,
    max_tokens: int = 2048
) -> Dict[str, Any]:
    """
    Vertex AI 호출 + 파일/DB 로그 기록
    """
    try:
        model = get_model()
        resp = model.generate_content(
            [prompt],
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )

        text = resp.text.strip() if hasattr(resp, "text") else ""

        # 로그 저장
        _log_to_file(prompt, text)
        _log_to_mysql(prompt, text)

        return {"ok": True, "text": text, "raw": resp, "error": None}

    except Exception as e:
        err = f"{e}\n{traceback.format_exc()}"
        _log_to_file(prompt, "", error=err)
        _log_to_mysql(prompt, "", error=err)
        return {"ok": False, "text": "", "raw": None, "error": err}
