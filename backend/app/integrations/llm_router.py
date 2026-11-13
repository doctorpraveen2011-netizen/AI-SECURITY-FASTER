"""
LLM Routing Service & Provider Abstraction.
Directs incoming chat, attack evaluation, and streaming requests to either official native Anthropic Claude SDK
or Google Gen AI Gemini SDK, with graceful fallback to an explicitly designated DEVELOPMENT MOCK MODE when keys are absent.
"""

import time
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.core.config import settings
from app.integrations.base_provider import BaseLLMProvider, ProviderResponse, ProviderTelemetry
from app.integrations.claude_client import AnthropicProvider
from app.integrations.gemini_client import GeminiProvider
from app.integrations.fallback_simulator import FallbackSimulator

class LLMRoutingService:
    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._init_providers()

    def _init_providers(self):
        self._providers["anthropic"] = AnthropicProvider()
        self._providers["gemini"] = GeminiProvider()

    def get_provider(self, provider_name: str) -> BaseLLMProvider:
        p = self._providers.get(provider_name.lower())
        if not p:
            raise ValueError(f"Unknown provider '{provider_name}'. Supported providers: 'anthropic', 'gemini'.")
        return p

    def resolve_provider_for_model(self, model_name: str) -> str:
        """Determines the official provider for a given model string."""
        lower_name = model_name.lower()
        if "claude" in lower_name:
            return "anthropic"
        elif "gemini" in lower_name:
            return "gemini"
        # Default based on prefix
        return "anthropic" if "claude" in settings.CLAUDE_DEFAULT_MODEL else "gemini"

    async def get_providers_status(self) -> Dict[str, Any]:
        """Runs live connection handshakes and returns official provider connectivity statuses."""
        self._init_providers()
        claude_test = await self._providers["anthropic"].test_connection()
        gemini_test = await self._providers["gemini"].test_connection()

        return {
            "anthropic": {
                "name": "Anthropic Claude Official API",
                "configured": bool(settings.ANTHROPIC_API_KEY),
                "is_connected": claude_test.get("connected", False),
                "status": claude_test.get("status", "DISCONNECTED"),
                "message": claude_test.get("message", ""),
                "active_model": settings.CLAUDE_DEFAULT_MODEL,
                "available_models": AnthropicProvider.AVAILABLE_MODELS,
                "sdk_version": "anthropic-2.8.0",
                "mode": "LIVE_API" if claude_test.get("connected") else "MOCK_DEVELOPMENT_MODE"
            },
            "gemini": {
                "name": "Google Gemini Official GenAI API",
                "configured": bool(settings.GEMINI_API_KEY),
                "is_connected": gemini_test.get("connected", False),
                "status": gemini_test.get("status", "DISCONNECTED"),
                "message": gemini_test.get("message", ""),
                "active_model": settings.GEMINI_DEFAULT_MODEL,
                "available_models": GeminiProvider.AVAILABLE_MODELS,
                "sdk_version": "google-genai-2.14.0",
                "mode": "LIVE_API" if gemini_test.get("connected") else "MOCK_DEVELOPMENT_MODE"
            }
        }

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        model: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        top_p: Optional[float] = None,
        top_k: Optional[int] = None,
        max_tokens: int = 1024,
        db_context: Optional[str] = None
    ) -> ProviderResponse:
        """Routes generation to the active native SDK, or transparently marks DEVELOPMENT MOCK MODE."""
        provider_name = self.resolve_provider_for_model(model)
        provider = self.get_provider(provider_name)
        start_time = time.time()

        # Check if provider has active authenticated credentials
        if provider.is_connected:
            try:
                return await provider.generate(
                    messages=messages,
                    system_prompt=system_prompt,
                    model=model,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    max_tokens=max_tokens
                )
            except Exception as e:
                # Capture real SDK error
                err_msg = str(e)
                # Fall through to mock development mode with clear telemetry error note
                sim = FallbackSimulator.simulate_chat_response(
                    model_name=model,
                    user_message=messages[-1].get("content", "") if messages else "",
                    system_prompt=system_prompt,
                    db_context=db_context
                )
                latency_ms = int((time.time() - start_time) * 1000)
                telemetry = ProviderTelemetry(
                    provider=provider_name,
                    model=model,
                    latency_ms=latency_ms,
                    tokens_used=sim["tokens_used"],
                    input_tokens=int(sim["tokens_used"] * 0.4),
                    output_tokens=int(sim["tokens_used"] * 0.6),
                    tokens_per_sec=round((sim["tokens_used"] * 0.6) / (latency_ms / 1000.0), 1),
                    is_live=False,
                    error=f"Live SDK Error: {err_msg} -> Routed to Mock Development Mode."
                )
                return ProviderResponse(reply=sim["reply"], telemetry=telemetry)

        # Provider not connected -> Explicit DEVELOPMENT MOCK MODE
        last_msg = messages[-1].get("content", "") if messages else ""
        sim = FallbackSimulator.simulate_chat_response(
            model_name=model,
            user_message=last_msg,
            system_prompt=system_prompt,
            db_context=db_context
        )
        latency_ms = sim["latency_ms"]
        tokens_used = sim["tokens_used"]
        input_tokens = int(tokens_used * 0.4)
        output_tokens = int(tokens_used * 0.6)
        tokens_per_sec = round(output_tokens / (latency_ms / 1000.0), 1)

        telemetry = ProviderTelemetry(
            provider=provider_name,
            model=model,
            latency_ms=latency_ms,
            tokens_used=tokens_used,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            tokens_per_sec=tokens_per_sec,
            is_live=False,
            stop_reason="mock_completion"
        )

        return ProviderResponse(reply=sim["reply"], telemetry=telemetry)

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        model: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        top_p: Optional[float] = None,
        top_k: Optional[int] = None,
        max_tokens: int = 1024,
        db_context: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Streams real-time tokens from official SDK, or emits mock stream chunks."""
        provider_name = self.resolve_provider_for_model(model)
        provider = self.get_provider(provider_name)

        if provider.is_connected:
            try:
                async for chunk in provider.stream(
                    messages=messages,
                    system_prompt=system_prompt,
                    model=model,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    max_tokens=max_tokens
                ):
                    yield chunk
                return
            except Exception as e:
                yield {
                    "type": "error",
                    "error": f"Official {provider_name.capitalize()} Stream Error: {str(e)}"
                }

        # Mock streaming simulation
        last_msg = messages[-1].get("content", "") if messages else ""
        sim = FallbackSimulator.simulate_chat_response(
            model_name=model,
            user_message=last_msg,
            system_prompt=system_prompt,
            db_context=db_context
        )

        words = sim["reply"].split(" ")
        for i, word in enumerate(words):
            yield {
                "type": "token",
                "chunk": word + (" " if i < len(words) - 1 else ""),
                "model": model,
                "provider": provider_name
            }
            import asyncio
            await asyncio.sleep(0.02)

        yield {
            "type": "done",
            "telemetry": {
                "provider": provider_name,
                "model": model,
                "latency_ms": sim["latency_ms"],
                "tokens_used": sim["tokens_used"],
                "input_tokens": int(sim["tokens_used"] * 0.4),
                "output_tokens": int(sim["tokens_used"] * 0.6),
                "tokens_per_sec": 35.0,
                "is_live": False,
                "stop_reason": "mock_stream_end"
            }
        }

# Global singleton
llm_router = LLMRoutingService()

