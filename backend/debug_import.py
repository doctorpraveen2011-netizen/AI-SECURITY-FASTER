import time
print("1. start", flush=True)
import app.core.compat
print("2. compat", flush=True)
import app.core.config
print("3. config", flush=True)
import anthropic
print("4. anthropic", flush=True)
import app.integrations.base_provider
print("5. base_provider", flush=True)
import app.integrations.claude_client
print("6. claude_client", flush=True)
p = app.integrations.claude_client.AnthropicProvider()
print("7. provider created", flush=True)

