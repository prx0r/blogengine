"""Tool: /api/astrology/snapshot wrapper for Hermes."""

import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional


SITE_BASE = "https://re-rendering-atlas.tradesprior.workers.dev"


def snapshot_save(
    date: str,
    user_id: Optional[str] = None,
    packet: Optional[dict] = None,
    signals: Optional[list] = None,
    dominant_mode: Optional[str] = None,
    oikodespotes: Optional[dict] = None,
    base_url: Optional[str] = None,
) -> str:
    """Save a daily snapshot for historical comparison.

    Args:
        date: ISO date string (YYYY-MM-DD)
        user_id: Optional user ID
        packet: Full astrology packet (optional — tool can refetch)
        signals: Signal data
        dominant_mode: "spirit", "fortune", or "mixed"
        oikodespotes: Daimon planet data
        base_url: Override the site base URL

    Returns:
        JSON string with save confirmation
    """
    url = f"{base_url or SITE_BASE}/api/astrology/snapshot"
    body = {"date": date}
    if user_id:
        body["user_id"] = user_id
    if packet:
        body["packet"] = packet
    if signals:
        body["signals"] = signals
    if dominant_mode:
        body["dominant_mode"] = dominant_mode
    if oikodespotes:
        body["oikodespotes"] = oikodespotes

    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return json.dumps({"error": f"HTTP {e.code}: {e.reason}"})
    except urllib.error.URLError as e:
        return json.dumps({"error": f"Connection failed: {e.reason}"})


def snapshot_list(
    user_id: str,
    days: int = 7,
    base_url: Optional[str] = None,
) -> str:
    """Retrieve past snapshots.

    Args:
        user_id: User ID
        days: Lookback window (default 7, max 90)
        base_url: Override the site base URL

    Returns:
        JSON string with list of snapshots
    """
    params = urllib.parse.urlencode({"user_id": user_id, "days": str(days)})
    url = f"{base_url or SITE_BASE}/api/astrology/snapshot?{params}"

    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return json.dumps({"error": f"HTTP {e.code}: {e.reason}"})
    except urllib.error.URLError as e:
        return json.dumps({"error": f"Connection failed: {e.reason}"})
