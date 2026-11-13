"""
Abstract Base Provider for Frontier Large Language Models.
Standardizes multi-provider execution, streaming, and telemetry across Anthropic Claude and Google Gemini.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from pydantic import BaseModel

class ProviderMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class ProviderTelemetry(BaseModel):
    provider: str
    model: str
    latency_ms: int
    tokens_used: int
    input_tokens: int = 0
    output_tokens: int = 0
    tokens_per_sec: float = 0.0
    is_live: bool = False
    stop_reason: Optional[str] = None
    error: Optional[str] = None

class ProviderResponse(BaseModel):
    reply: str
    telemetry: ProviderTelemetry

class BaseLLMProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns provider identifier: 'anthropic' or 'gemini'."""
        pass

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        """Returns True if valid API key is loaded and authenticated."""
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Performs a live minimal API handshake to verify credentials."""
        pass

    @abstractmethod
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
        """Generates a complete response with telemetry."""
        pass

    @abstractmethod
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
        """Streams response tokens followed by a final telemetry chunk."""
        pass

