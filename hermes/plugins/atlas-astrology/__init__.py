"""Atlas Astrology — Hermes plugin for the Re-Rendering Atlas astrology engine."""

from .tools.astrology import astrology_tool
from .tools.graph import graph_traverse
from .tools.journal import journal_write
from .tools.snapshot import snapshot_save, snapshot_list


def register():
    """Register all tools with Hermes."""
    return {
        "astrology_today": astrology_tool,
        "astrology_graph": graph_traverse,
        "journal_write": journal_write,
        "snapshot_save": snapshot_save,
        "snapshot_list": snapshot_list,
    }
