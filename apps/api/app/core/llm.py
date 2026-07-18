from typing import Optional
import asyncio
from app.core.config import settings


def create_llm_client():
    if not settings.LLM_API_KEY or not settings.LLM_BASE_URL:
        return None
    from openai import OpenAI

    return OpenAI(api_key=settings.LLM_API_KEY, base_url=settings.LLM_BASE_URL)


_llm_client = None


def get_llm_client():
    global _llm_client
    if _llm_client is None:
        _llm_client = create_llm_client()
    return _llm_client


def _sync_generate_text(prompt: str, model: str, max_tokens: int) -> str:
    client = get_llm_client()
    if client is None:
        raise RuntimeError("LLM not configured (set LLM_API_KEY and LLM_BASE_URL)")

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


async def generate_text(prompt: str, model: Optional[str] = None, max_tokens: int = 2000) -> str:
    model = model or settings.LLM_MODEL
    return await asyncio.to_thread(_sync_generate_text, prompt, model, max_tokens)
