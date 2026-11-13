"""
Official Native Google Gemini Integration.
Uses the official Google Gen AI Python SDK (google-genai) and Gemini Interactions API.
Supports multi-turn conversations, configurable models, streaming, and granular telemetry.
"""

import time
from typing import List, Dict, Any, Optional, AsyncGenerator
from google import genai
from google.genai import types
from app.core.config import settings
from app.integrations.base_provider import BaseLLMProvider, ProviderResponse, ProviderTelemetry

class GeminiProvider(BaseLLMProvider):
    AVAILABLE_MODELS = [
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self._client: Optional[genai.Client] = None
        if self.api_key:
            self._client = genai.Client(api_key=self.api_key)

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def is_connected(self) -> bool:
        return bool(self.api_key and self._client)

    async def test_connection(self) -> Dict[str, Any]:
        """Performs a real minimal authenticated request to Google Gemini API."""
        if not self.api_key:
            return {
                "connected": False,
                "status": "DISCONNECTED",
                "message": "No Google Gemini API key configured."
            }

        try:
            client = genai.Client(api_key=self.api_key)
            cfg = types.GenerateContentConfig(max_output_tokens=1)
            probe = await client.aio.models.generate_content(
                model="gemini-1.5-flash",
                contents="ping",
                config=cfg
            )
            return {
                "connected": True,
                "status": "LIVE_CONNECTED",
                "provider": "gemini",
                "model_tested": "gemini-1.5-flash",
                "message": "Live Google Gemini official SDK connected and authenticated."
            }
        except Exception as e:
            err_str = str(e)
            if "API_KEY_INVALID" in err_str or "400" in err_str:
                return {
                    "connected": False,
                    "status": "INVALID_API_KEY",
                    "message": "Google Gemini API key is invalid or unauthorized."
                }
            elif "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                return {
                    "connected": False,
                    "status": "RATE_LIMITED",
                    "message": "Google Gemini API quota exceeded."
                }
            return {
                "connected": False,
                "status": "CONNECTION_ERROR",
                "message": f"Google GenAI SDK Error: {err_str}"
            }

    def _format_contents(self, messages: List[Dict[str, str]]) -> List[types.Content]:
        """Formats standard chat messages into Google GenAI Content types."""
        contents: List[types.Content] = []
        for msg in messages:
            role = msg.get("role", "user")
            content_text = msg.get("content", "").strip()
            if not content_text:
                continue

            normalized_role = "model" if role in ["assistant", "model"] else "user"
            part = types.Part.from_text(text=content_text)
            contents.append(types.Content(role=normalized_role, parts=[part]))

        if not contents:
            contents = [types.Content(role="user", parts=[types.Part.from_text(text="Hello")])]

        return contents

    async def generate(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        top_p: Optional[float] = None,
        top_k: Optional[int] = None,
        max_tokens: int = 1024
    ) -> ProviderResponse:
        if not self.api_key or not self._client:
            raise ValueError("Google Gemini API key is not configured. Supply GEMINI_API_KEY to activate.")

        target_model = model or settings.GEMINI_DEFAULT_MODEL
        contents = self._format_contents(messages)
        start_time = time.time()

        cfg_kwargs: Dict[str, Any] = {
            "temperature": max(0.0, min(2.0, temperature)),
            "max_output_tokens": max(1, min(8192, max_tokens)),
            # BLOCK_NONE for empirical cybersecurity red-teaming evaluations
            "safety_settings": [
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
            ]
        }

        if top_p is not None:
            cfg_kwargs["top_p"] = max(0.0, min(1.0, top_p))
        if top_k is not None:
            cfg_kwargs["top_k"] = max(1, top_k)
        if system_prompt:
            cfg_kwargs["system_instruction"] = system_prompt

        config = types.GenerateContentConfig(**cfg_kwargs)

        response = await self._client.aio.models.generate_content(
            model=target_model,
            contents=contents,
            config=config
        )
        latency_ms = int((time.time() - start_time) * 1000)

        reply_text = response.text or ""

        # Extract usage metadata
        usage = getattr(response, "usage_metadata", None)
        prompt_tokens = getattr(usage, "prompt_token_count", 0) if usage else 0
        cand_tokens = getattr(usage, "candidates_token_count", 0) if usage else 0
        total_tokens = getattr(usage, "total_token_count", prompt_tokens + cand_tokens) if usage else len(reply_text.split())

        tokens_per_sec = round((cand_tokens / (latency_ms / 1000.0)), 1) if latency_ms > 0 and cand_tokens > 0 else 0.0

        telemetry = ProviderTelemetry(
            provider="gemini",
            model=target_model,
            latency_ms=latency_ms,
            tokens_used=total_tokens,
            input_tokens=prompt_tokens,
            output_tokens=cand_tokens,
            tokens_per_sec=tokens_per_sec,
            is_live=True
        )

        return ProviderResponse(reply=reply_text, telemetry=telemetry)

    # Alias for backwards compatibility
    async def generate_response(self, *args, **kwargs) -> Dict[str, Any]:
        resp = await self.generate(*args, **kwargs)
        return {
            "reply": resp.reply,
            "latency_ms": resp.telemetry.latency_ms,
            "tokens_used": resp.telemetry.tokens_used,
            "input_tokens": resp.telemetry.input_tokens,
            "output_tokens": resp.telemetry.output_tokens,
            "tokens_per_sec": resp.telemetry.tokens_per_sec,
            "is_live": resp.telemetry.is_live,
            "model": resp.telemetry.model,
            "provider": resp.telemetry.provider
        }

    async def stream(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        top_p: Optional[float] = None,
        top_k: Optional[int] = None,
        max_tokens: int = 1024
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if not self.api_key or not self._client:
            raise ValueError("Google Gemini API key is not configured.")

        target_model = model or settings.GEMINI_DEFAULT_MODEL
        contents = self._format_contents(messages)
        start_time = time.time()

        cfg_kwargs: Dict[str, Any] = {
            "temperature": max(0.0, min(2.0, temperature)),
            "max_output_tokens": max(1, min(8192, max_tokens)),
            "safety_settings": [
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
            ]
        }

        if top_p is not None:
            cfg_kwargs["top_p"] = max(0.0, min(1.0, top_p))
        if top_k is not None:
            cfg_kwargs["top_k"] = max(1, top_k)
        if system_prompt:
            cfg_kwargs["system_instruction"] = system_prompt

        config = types.GenerateContentConfig(**cfg_kwargs)

        accumulated_text = []
        prompt_tokens = 0
        cand_tokens = 0

        stream_resp = self._client.aio.models.generate_content_stream(
            model=target_model,
            contents=contents,
            config=config
        )

        async for chunk in stream_resp:
            chunk_text = chunk.text or ""
            if chunk_text:
                accumulated_text.append(chunk_text)
                yield {
                    "type": "token",
                    "chunk": chunk_text,
                    "model": target_model,
                    "provider": "gemini"
                }
            if hasattr(chunk, "usage_metadata") and chunk.usage_metadata:
                prompt_tokens = getattr(chunk.usage_metadata, "prompt_token_count", prompt_tokens)
                cand_tokens = getattr(chunk.usage_metadata, "candidates_token_count", cand_tokens)

        latency_ms = int((time.time() - start_time) * 1000)
        total_tokens = prompt_tokens + cand_tokens if (prompt_tokens + cand_tokens) > 0 else len("".join(accumulated_text).split())
        tokens_per_sec = round((cand_tokens / (latency_ms / 1000.0)), 1) if latency_ms > 0 and cand_tokens > 0 else 0.0

        yield {
            "type": "done",
            "telemetry": {
                "provider": "gemini",
                "model": target_model,
                "latency_ms": latency_ms,
                "tokens_used": total_tokens,
                "input_tokens": prompt_tokens,
                "output_tokens": cand_tokens,
                "tokens_per_sec": tokens_per_sec,
                "is_live": True
            }
        }

# Maintain legacy alias for existing references
GeminiClient = GeminiProvider
