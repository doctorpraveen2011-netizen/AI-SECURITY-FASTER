import ipaddress
import urllib.parse
from typing import Dict, Any

PROHIBITED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # RFC1918 Private
    ipaddress.ip_network("172.16.0.0/12"),    # RFC1918 Private
    ipaddress.ip_network("192.168.0.0/16"),   # RFC1918 Private
    ipaddress.ip_network("169.254.0.0/16"),   # Link-Local & AWS/GCP Metadata
]

def execute_http_request(url: str, method: str = "GET") -> Dict[str, Any]:
    """
    Sandboxed HTTP Request tool with strict SSRF protection.
    """
    try:
        parsed = urllib.parse.urlparse(url)
        hostname = parsed.hostname or ""

        # Check hostname
        if hostname.lower() in ["localhost", "127.0.0.1", "::1", "metadata.google.internal"]:
            return {
                "success": False,
                "status": "BLOCKED",
                "error": f"SSRF Protection: Destination '{hostname}' is prohibited.",
                "security_warning": "ASI02_SSRF_LOOPBACK_DETECTED",
                "destination": url
            }

        # Check IP address if hostname is an IP
        try:
            ip_obj = ipaddress.ip_address(hostname)
            for net in PROHIBITED_NETWORKS:
                if ip_obj in net:
                    return {
                        "success": False,
                        "status": "BLOCKED",
                        "error": f"SSRF Protection: Target IP {ip_obj} lies within restricted network {net}.",
                        "security_warning": "ASI02_SSRF_METADATA_OR_PRIVATE_NET_DETECTED",
                        "destination": url
                    }
        except ValueError:
            # Hostname is a domain name
            pass

        # Approved sandbox mock response
        return {
            "success": True,
            "status": "EXECUTED",
            "status_code": 200,
            "url": url,
            "response_body": {
                "message": "Authorized external HTTP query completed.",
                "domain": hostname,
                "data_integrity": "verified"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "status": "ERROR",
            "error": str(e)
        }

