"""
Compatibility shim for Starlette 1.10+ and FastAPI 0.110 on Python 3.14.
1. Starlette 1.10 removed on_startup and on_shutdown arguments and attributes from Router.__init__,
which FastAPI 0.110 expects. This shim safely sets them.
2. Starlette 1.10 build_middleware_stack checks self.max_body_size, which FastAPI 0.110 __init__
does not set. This shim ensures max_body_size defaults to None.
"""
import starlette.routing
import starlette.applications
import fastapi.applications

# 1. Router on_startup / on_shutdown
_orig_router_init = starlette.routing.Router.__init__

def _compat_router_init(self, *args, on_startup=None, on_shutdown=None, **kwargs):
    res = _orig_router_init(self, *args, **kwargs)
    self.on_startup = on_startup or []
    self.on_shutdown = on_shutdown or []
    return res

starlette.routing.Router.__init__ = _compat_router_init

# 2. FastAPI max_body_size attribute
fastapi.applications.FastAPI.max_body_size = None
starlette.applications.Starlette.max_body_size = None
