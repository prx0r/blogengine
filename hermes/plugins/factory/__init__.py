"""Factory plugin — video production tools for Hermes."""

from .tools.clean import clean_narration, integrity_check
from .tools.render import search_scenes
from .tools.validate import analyze_output

def register():
    """Register all tools with Hermes."""
    return {
        "factory_clean_narration": clean_narration,
        "factory_integrity_check": integrity_check,
        "factory_search_scenes": search_scenes,
        "factory_analyze_output": analyze_output,
    }
