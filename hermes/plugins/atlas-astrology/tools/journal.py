"""Tool: /api/journal wrapper for Hermes."""

import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional


SITE_BASE = "https://re-rendering-atlas.tradesprior.workers.dev"


def journal_write(
    content: str,
    kind: str = "journal_entry",
    user_id: Optional[str] = None,
    base_url: Optional[str] = None,
) -> str:
    """Save a diary/journal entry.

    Args:
        content: The text content of the entry
        kind: Entry kind (journal_entry, dream, practice_log, etc.)
        user_id: User ID (if not provided, uses session auth)
        base_url: Override the site base URL

    Returns:
        JSON string with the created entry
    """
    url = f"{base_url or SITE_BASE}/api/journal"
    payload = json.dumps({
        "content": content,
        "kind": kind,
    })
    if user_id:
        payload["user_id"] = user_id

    req = urllib.request.Request(
        url,
        data=payload.encode("utf-8"),
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
