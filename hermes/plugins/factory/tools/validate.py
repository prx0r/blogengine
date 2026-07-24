"""Validation tools."""
import json, subprocess

def analyze_output(output_dir: str) -> dict:
    """Score rendered output against platinum rubric."""
    result = subprocess.run(
        ["python3", "/root/projects/blog/factory/scripts/analyze-output.py", output_dir],
        capture_output=True, text=True, timeout=30
    )
    # analyze-output.py saves analysis_report.json to the output dir
    report_path = f"{output_dir}/analysis_report.json"
    try:
        return json.load(open(report_path))
    except:
        return {"error": "Analysis failed", "raw": result.stdout[:500]}
