"""Tool: /api/astrology/graph wrapper for Hermes."""

import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional


SITE_BASE = "https://re-rendering-atlas.tradesprior.workers.dev"


def graph_traverse(
    id: Optional[str] = None,
    planet: Optional[str] = None,
    type: Optional[str] = None,
    base_url: Optional[str] = None,
) -> str:
    """Traverse the knowledge graph.

    Args:
        id: Node ID to traverse (e.g. "planet:mars")
        planet: Cluster by planet (e.g. "mars")
        type: Query type ("all", "layers", "correspondences")
        base_url: Override the site base URL

    Returns:
        JSON string with nodes and edges
    """
    params = {}
    if id:
        params["id"] = id
    if planet:
        params["planet"] = planet
    if type:
        params["type"] = type

    if not params:
        return json.dumps({"error": "Specify ?id=, ?planet=, or ?type="})

    query = urllib.parse.urlencode(params)
    url = f"{base_url or SITE_BASE}/api/astrology/graph?{query}"

    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return json.dumps({"error": f"HTTP {e.code}: {e.reason}"})
    except urllib.error.URLError as e:
        return json.dumps({"error": f"Connection failed: {e.reason}"})
