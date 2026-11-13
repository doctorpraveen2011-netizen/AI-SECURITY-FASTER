import os
from typing import Dict, Any
from app.core.config import settings

def execute_file_read(file_path: str) -> Dict[str, Any]:
    """
    Sandboxed File Read tool with strict canonical path traversal prevention.
    """
    sandbox_root = os.path.realpath(settings.SANDBOX_DIR)

    # Check for direct path traversal symbols
    if ".." in file_path or file_path.startswith("/") or (len(file_path) > 1 and file_path[1] == ":"):
        target_path = os.path.realpath(os.path.join(sandbox_root, file_path))
    else:
        target_path = os.path.realpath(os.path.join(sandbox_root, file_path))

    # Security check: Does target_path stay strictly inside sandbox_root?
    if not target_path.startswith(sandbox_root):
        return {
            "success": False,
            "status": "BLOCKED",
            "error": f"Security Violation: Path traversal attempt detected ({file_path}). Access outside sandbox is strictly prohibited.",
            "security_warning": "ASI02_PATH_TRAVERSAL_DETECTED",
            "content": None
        }

    if not os.path.exists(target_path):
        return {
            "success": False,
            "status": "ERROR",
            "error": f"File not found: {file_path}",
            "content": None
        }

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {
            "success": True,
            "status": "EXECUTED",
            "content": content,
            "bytes_read": len(content)
        }
    except Exception as e:
        return {
            "success": False,
            "status": "ERROR",
            "error": str(e),
            "content": None
        }

