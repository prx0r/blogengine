"""Render and scene search tools."""
import json, subprocess

def search_scenes(concept: str, top_k: int = 5) -> list:
    """Search 261 scene functions by concept keyword."""
    result = subprocess.run(
        ["python3", "/root/projects/blog/factory/scripts/search-scenes.py", concept, "--top", str(top_k)],
        capture_output=True, text=True, timeout=15
    )
    lines = result.stdout.strip().split('\n')
    # Parse the table output
    scenes = []
    for line in lines[3:]:  # skip header
        parts = line.split()
        if len(parts) >= 4:
            try:
                score = parts[0].replace('%', '')
                scenes.append({
                    "score": score,
                    "function": parts[1],
                    "pack": parts[2],
                    "description": ' '.join(parts[3:])
                })
            except:
                pass
    return scenes[:top_k]
