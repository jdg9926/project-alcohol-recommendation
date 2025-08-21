import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# .env 로드 (없어도 에러 아님)
load_dotenv()


def _get_required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"[CONFIG] 환경변수 {name} 가 비어있습니다. .env 또는 OS 환경변수로 설정하세요.")
    return value


def get_google_credentials_path():
    path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not path or not os.path.exists(path):
        raise FileNotFoundError(f"[CONFIG] GOOGLE_APPLICATION_CREDENTIALS 경로가 존재하지 않습니다: {path}")
    return path

def get_vertex_project_id() -> str:
    """
    Vertex AI 프로젝트 ID
    """
    return _get_required("VERTEX_PROJECT_ID")


def get_vertex_location() -> str:
    """
    Vertex AI 리전 (예: us-central1)
    """
    return _get_required("VERTEX_LOCATION")


def get_vertex_model() -> str:
    """
    사용할 모델 (기본값 제공)
    """
    return os.getenv("VERTEX_MODEL", "gemini-1.5-flash-001")


def get_board_api_base() -> str:
    """
    스프링 부트 API 베이스 URL (예: http://localhost:8888)
    """
    return os.getenv("BOARD_API_BASE", "http://localhost:8888")


def get_port(default: int = 8000) -> int:
    """
    파이썬 서버 포트
    """
    val = os.getenv("PORT")
    if not val:
        return default
    try:
        return int(val)
    except ValueError:
        return default
