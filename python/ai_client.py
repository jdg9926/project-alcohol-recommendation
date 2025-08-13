import os
import traceback
from typing import Optional, Dict, Any

from google.genai import client
from google.genai.types import GenerateContentConfig, Part

from config import (
    get_google_credentials_path,
    get_vertex_project_id,
    get_vertex_location,
    get_vertex_model,
)

# GOOGLE_APPLICATION_CREDENTIALS 유효성 확인 (google.genai가 내부적으로 사용)
_ = get_google_credentials_path()

# 모든 값은 환경변수에서만 읽음
_PROJECT_ID = get_vertex_project_id()
_LOCATION = get_vertex_location()
_MODEL_ID = get_vertex_model()

# 전역 클라이언트 (필요 시 재사용)
_genai_client: Optional[client.Client] = None


def get_client() -> client.Client:
    global _genai_client
    if _genai_client is None:
        _genai_client = client.Client(
            vertexai=True,
            project=_PROJECT_ID,
            location=_LOCATION
        )
    return _genai_client


def generate_text(prompt: str, temperature: float = 0.3, max_tokens: int = 512) -> Dict[str, Any]:
    """
    Vertex AI에 텍스트 생성 요청.
    반환: { "ok": bool, "text": str, "raw": Any, "error": Optional[str] }
    """
    try:
        c = get_client()
        resp = c.responses.generate(
            model=_MODEL_ID,
            contents=[Part.from_text(prompt)],
            config=GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
        )

        # google-genai 응답에서 텍스트 추출
        text = ""
        if hasattr(resp, "response") and resp.response and resp.response.candidates:
            parts = resp.response.candidates[0].content.parts
            if parts and hasattr(parts[0], "text"):
                text = parts[0].text or ""
        elif hasattr(resp, "candidates") and resp.candidates:
            parts = resp.candidates[0].content.parts
            if parts and hasattr(parts[0], "text"):
                text = parts[0].text or ""

        return {
            "ok": True,
            "text": text.strip(),
            "raw": resp,
            "error": None
        }
    except Exception as e:
        return {
            "ok": False,
            "text": "",
            "raw": None,
            "error": f"{e}\n{traceback.format_exc()}"
        }
