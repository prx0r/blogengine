#!/usr/bin/env python3
"""
VPS Render Worker — claims render tasks from the factory and executes them.

Run: R2_KEY=xxx R2_SECRET=xxx RENDER_TOKEN=xxx python3 scripts/vps-render-worker.py
"""
import json, os, subprocess, sys, time, urllib.request, urllib.error, hashlib
from pathlib import Path

API = "https://platinum-factory.tradesprior.workers.dev"
TOKEN = os.environ.get("RENDER_TOKEN", "dev-token")
WORK_DIR = Path("/tmp/platinum-render-tasks")
WORK_DIR.mkdir(parents=True, exist_ok=True)

R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com")

import boto3
from botocore.config import Config
def s3_client():
    return boto3.client('s3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=os.environ.get("R2_KEY", ""),
        aws_secret_access_key=os.environ.get("R2_SECRET", ""),
        config=Config(signature_version='s3v4'))


def api_get(path):
    req = urllib.request.Request(f"{API}{path}", headers={"Authorization": f"Bearer {TOKEN}"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def api_post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(f"{API}{path}", data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
        method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def fail_task(task_id, code, message):
    api_post(f"/render-tasks/{task_id}/complete", {"status": "failed", "error": f"[{code}] {message}"})
    print(f"  ❌ FAILED: {code}")


def execute_task(task):
    task_id = task["task_id"]
    manifest = json.loads(task.get("input_manifest_json", "{}"))
    render_script = manifest.get("render_script", {})
    r2_key = render_script.get("r2_key", "") if isinstance(render_script, dict) else ""
    
    print(f"\nTask: {task_id}")
    
    if not r2_key:
        fail_task(task_id, "NO_RENDER_SCRIPT", "No render_script.r2_key in manifest")
        return
    
    task_dir = WORK_DIR / task_id
    task_dir.mkdir(parents=True, exist_ok=True)
    
    # Download render code
    script_path = task_dir / "render_pack.py"
    try:
        s3_client().download_file('factory-assets', r2_key, str(script_path))
        print(f"  Downloaded: {r2_key}")
    except Exception as e:
        fail_task(task_id, "DOWNLOAD_FAILED", str(e))
        return
    
    # Syntax check
    result = subprocess.run([sys.executable, "-m", "py_compile", str(script_path)],
                          capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        fail_task(task_id, "SYNTAX_ERROR", result.stderr[:500])
        return
    
    # Execute with heartbeat and fail-closed
    proc = subprocess.Popen(
        [sys.executable, str(script_path)],
        cwd=str(task_dir),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True
    )
    
    # Heartbeat loop while rendering
    start = time.time()
    while proc.poll() is None:
        try:
            api_post(f"/render-tasks/{task_id}/heartbeat", {})
        except:
            pass
        time.sleep(20)
    
    stdout, stderr = proc.communicate()
    elapsed = time.time() - start
    
    # FAIL-CLOSED: check return code
    if proc.returncode != 0:
        fail_task(task_id, "RENDER_FAILED", stderr[-1000:] if stderr else "Unknown error")
        return
    
    # Find outputs
    mp4_files = sorted(task_dir.rglob("*.mp4"))
    if not mp4_files:
        fail_task(task_id, "NO_OUTPUT", "Renderer produced no MP4 files")
        return
    
    # Upload to R2
    s3 = s3_client()
    outputs = {"shots_rendered": 0, "files": []}
    for mp4 in mp4_files:
        r2_dest = f"renders/worker-output/{task_id}/{mp4.name}"
        s3.upload_file(str(mp4), 'factory-assets', r2_dest)
        outputs["shots_rendered"] += 1
        outputs["files"].append(r2_dest)
    
    # Report completion
    api_post(f"/render-tasks/{task_id}/complete", {
        "status": "completed",
        "outputs": outputs,
        "metrics": {"render_time_s": round(elapsed, 1)}
    })
    print(f"  ✅ Done: {outputs['shots_rendered']} files in {elapsed:.1f}s")


def main():
    print("VPS Render Worker starting...")
    print(f"  Polling: {API}/render-tasks/claim")
    print(f"  Token: {TOKEN[:8]}...")
    
    while True:
        try:
            task = api_get("/render-tasks/claim")
            if "task_id" in task and task.get("status") == "claimed":
                execute_task(task)
            else:
                print(".", end="", flush=True)
                time.sleep(5)
        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            print(f"\n  Error: {e}")
            time.sleep(10)


if __name__ == "__main__":
    main()
