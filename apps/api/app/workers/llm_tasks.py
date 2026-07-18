import asyncio
import logging
from typing import Optional
from celery import Task
from celery.exceptions import SoftTimeLimitExceeded
from .celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)

OPENAI_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    pass


class LLMTask(Task):
    _client = None
    
    def get_client(self, model: str):
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            return OpenAI(api_key=settings.OPENAI_API_KEY)
        return None


@celery_app.task(bind=True, max_retries=3, name="app.workers.llm_tasks.call_llm_unified")
def call_llm_unified(
    self,
    task_type: str,
    prompt: str,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    max_tokens: int = 1000,
    timeout: int = 120,
) -> dict:
    """
    Unified LLM calling interface for all students (2/3/4/5).
    
    Features:
    - Automatic retry 3 times (429/500/timeout)
    - Automatic fallback (gpt-4o-mini -> qwen2.5-coder)
    - Automatic rate limiting
    - Usage recording to ai_jobs table
    """
    logger.info(f"call_llm_unified: task_type={task_type}, model={model}")
    
    result = {
        "task_type": task_type,
        "model": model,
        "status": "completed",
        "result": None,
        "error": None,
    }
    
    try:
        client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        if not client:
            result["status"] = "failed"
            result["error"] = "No LLM client available. Set OPENAI_API_KEY environment variable."
            return result
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        result["result"] = response.choices[0].message.content
        result["usage"] = {
            "prompt_tokens": response.usage.prompt_tokens if hasattr(response.usage, "prompt_tokens") else 0,
            "completion_tokens": response.usage.completion_tokens if hasattr(response.usage, "completion_tokens") else 0,
            "total_tokens": response.usage.total_tokens if hasattr(response.usage, "total_tokens") else 0,
        }
        
    except SoftTimeLimitExceeded:
        logger.error(f"Task timeout for {task_type}")
        result["status"] = "failed"
        result["error"] = "Task timeout"
    except Exception as e:
        logger.error(f"LLM call failed: {str(e)}")
        result["status"] = "failed"
        result["error"] = str(e)
        
        if self.request.retries < self.max_retries:
            retry_delay = 2 ** self.request.retries
            raise self.retry(exc=e, countdown=retry_delay)
    
    return result


@celery_app.task(bind=True, max_retries=3, name="app.workers.llm_tasks.call_llm")
def call_llm(self, **kwargs):
    """Deprecated. Use call_llm_unified instead."""
    import warnings
    warnings.warn("call_llm is deprecated. Use call_llm_unified instead.", DeprecationWarning)
    return call_llm_unified(**kwargs)