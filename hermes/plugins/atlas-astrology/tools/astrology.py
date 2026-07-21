"""Tool: /api/astrology/today wrapper for Hermes."""

import json
import urllib.request
import urllib.error
from typing import Optional


SITE_BASE = "https://re-rendering-atlas.tradesprior.workers.dev"


def astrology_tool(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int = 0,
    lat: float = 51.41,
    lon: float = -0.67,
    name: str = "Native",
    timezone: int = 0,
    base_url: Optional[str] = None,
) -> str:
    """Compute today's astrological reading.

    Args:
        year: Birth year
        month: Birth month (1-12)
        day: Birth day
        hour: Birth hour (0-23)
        minute: Birth minute (0-59)
        lat: Birth latitude
        lon: Birth longitude
        name: Native's name
        timezone: Timezone offset from UTC
        base_url: Override the site base URL (for testing)

    Returns:
        JSON string with chart, signals, oikodespotes, interpretation, graph data
    """
    url = f"{base_url or SITE_BASE}/api/astrology/today"
    payload = json.dumps({
        "year": year, "month": month, "day": day,
        "hour": hour, "minute": minute,
        "lat": lat, "lon": lon,
        "name": name, "timezone": timezone,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return json.dumps({"error": f"HTTP {e.code}: {e.reason}", "body": e.read().decode()})
    except urllib.error.URLError as e:
        return json.dumps({"error": f"Connection failed: {e.reason}"})


def check_fn() -> bool:
    """Verify the site is reachable."""
    try:
        urllib.request.urlopen(f"{SITE_BASE}/api/astrology/graph?type=layers", timeout=10)
        return True
    except Exception:
        return False
