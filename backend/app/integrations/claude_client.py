"""
Official Native Anthropic Claude Integration.
Uses the official Anthropic Python SDK (anthropic.AsyncAnthropic) and Messages API.
Supports multi-turn conversations, configurable models, streaming, and granular telemetry.
"""

import time
import os
from typing import List, Dict, Any, Optional, AsyncGenerator
import anthropic
from app.core.config import settings
from app.integrations.base_provider import BaseLLMProvider, ProviderResponse, ProviderTelemetry

class AnthropicProvider(BaseLLMProvider):
    AVAILABLE_MODELS = [
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
        "claude-3-5-haiku-20241022"
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self._client: Optional[anthropic.AsyncAnthropic] = None
        if self.api_key:
            self._client = anthropic.AsyncAnthropic(api_key=self.api_key)

    @property
    def provider_name(self) -> str:
        return "anthropic"

    @property
    def is_connected(self) -> bool:
        return bool(self.api_key and self._client)

    async def test_connection(self) -> Dict[str, Any]:
        """Performs a real minimal authenticated request to Anthropic API."""
        if not self.api_key:
            return {
                "connected": False,
                "status": "DISCONNECTED",
                "message": "No Anthropic API key configured."
            }

        try:
            client = anthropic.AsyncAnthropic(api_key=self.api_key, timeout=10.0)
            # Perform a minimal 1-token probe request
            probe = await client.messages.create(
                model="claude-3-5-haiku-20241022",
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1
            )
            return {
                "connected": True,
                "status": "LIVE_CONNECTED",
                "provider": "anthropic",
                "model_tested": "claude-3-5-haiku-20241022",
                "message": "Live Anthropic Claude official SDK connected and authenticated.",
                "response_id": probe.id
            }
        except anthropic.AuthenticationError as e:
            return {
                "connected": False,
                "status": "INVALID_API_KEY",
                "message": f"Anthropic Authentication Failed: {str(e)}"
            }
        except anthropic.RateLimitError as e:
            return {
                "connected": False,
                "status": "RATE_LIMITED",
                "message": f"Anthropic Rate Limit Exceeded: {str(e)}"
            }
        except Exception as e:
            return {
                "connected": False,
                "status": "CONNECTION_ERROR",
                "message": f"Anthropic SDK Error: {str(e)}"
            }

    def _format_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Normalizes message history to strictly alternating user/assistant turns."""
        formatted: List[Dict[str, str]] = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "").strip()
            if not content:
                continue

            normalized_role = "assistant" if role in ["assistant", "model"] else "user"

            # Merge consecutive messages of the same role
            if formatted and formatted[-1]["role"] == normalized_role:
                formatted[-1]["content"] += "\n\n" + content
            else:
                formatted.append({"role": normalized_role, "content": content})

        if not formatted:
            formatted = [{"role": "user", "content": "Hello"}]

        # Ensure first message is user
        if formatted[0]["role"] != "user":
            formatted.insert(0, {"role": "user", "content": "Begin conversation."})

        return formatted

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
            raise ValueError("Anthropic API key is not configured. Supply ANTHROPIC_API_KEY to activate.")

        target_model = model or settings.CLAUDE_DEFAULT_MODEL
        formatted_messages = self._format_messages(messages)
        start_time = time.time()

        kwargs: Dict[str, Any] = {
            "model": target_model,
            "messages": formatted_messages,
            "max_tokens": max(1, min(4096, max_tokens)),
            "temperature": max(0.0, min(1.0, temperature))
        }

        if top_p is not None:
            kwargs["top_p"] = max(0.0, min(1.0, top_p))
        if top_k is not None:
            kwargs["top_k"] = max(1, top_k)
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self._client.messages.create(**kwargs)
        latency_ms = int((time.time() - start_time) * 1000)

        # Parse text content blocks
        reply_text = "".join([b.text for b in response.content if hasattr(b, "text")])

        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        total_tokens = input_tokens + output_tokens
        tokens_per_sec = round((output_tokens / (latency_ms / 1000.0)), 1) if latency_ms > 0 else 0.0

        telemetry = ProviderTelemetry(
            provider="anthropic",
            model=target_model,
            latency_ms=latency_ms,
            tokens_used=total_tokens,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            tokens_per_sec=tokens_per_sec,
            is_live=True,
            stop_reason=response.stop_reason
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
            raise ValueError("Anthropic API key is not configured.")

        target_model = model or settings.CLAUDE_DEFAULT_MODEL
        formatted_messages = self._format_messages(messages)
        start_time = time.time()

        kwargs: Dict[str, Any] = {
            "model": target_model,
            "messages": formatted_messages,
            "max_tokens": max(1, min(4096, max_tokens)),
            "temperature": max(0.0, min(1.0, temperature))
        }

        if top_p is not None:
            kwargs["top_p"] = max(0.0, min(1.0, top_p))
        if top_k is not None:
            kwargs["top_k"] = max(1, top_k)
        if system_prompt:
            kwargs["system"] = system_prompt

        accumulated_text = []
        input_tokens = 0
        output_tokens = 0
        stop_reason = "end_turn"

        async with self._client.messages.stream(**kwargs) as stream_ctx:
            async for text_chunk in stream_ctx.text_stream:
                accumulated_text.append(text_chunk)
                yield {
                    "type": "token",
                    "chunk": text_chunk,
                    "model": target_model,
                    "provider": "anthropic"
                }

            final_message = await stream_ctx.get_final_message()
            input_tokens = final_message.usage.input_tokens
            output_tokens = final_message.usage.output_tokens
            stop_reason = final_message.stop_reason

        latency_ms = int((time.time() - start_time) * 1000)
        total_tokens = input_tokens + output_tokens
        tokens_per_sec = round((output_tokens / (latency_ms / 1000.0)), 1) if latency_ms > 0 else 0.0

        yield {
            "type": "done",
            "telemetry": {
                "provider": "anthropic",
                "model": target_model,
                "latency_ms": latency_ms,
                "tokens_used": total_tokens,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "tokens_per_sec": tokens_per_sec,
                "is_live": True,
                "stop_reason": stop_reason
            }
        }

# Maintain legacy alias for existing references
ClaudeClient = AnthropicProvider
