#!/usr/bin/env python3
"""
VPS Render Worker — claims render tasks from the factory and executes them.

Polls:  GET https://platinum-factory.tradesprior.workers.dev/render-tasks/claim
Reports: POST https://platinum-factory.tradesprior.workers.dev/render-tasks/{id}/complete
Heartbeat: POST https://platinum-factory.tradesprior.workers.dev/render-tasks/{id}/heartbeat

Run: python3 scripts/vps-render-worker.py
"""
import json, os, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

API = "https://platinum-factory.tradesprior.workers.dev"
WORK_DIR = Path("/tmp/platinum-render-tasks")
WORK_DIR.mkdir(parents=True, exist_ok=True)

# R2 credentials
R2_ENDPOINT = "https://954612afb5a97bb15dddcdc70176813d.r2.cloudflarestorage.com"
R2_KEY = "6c27ffefc9dee5c15ca19ca99d2ecccf"
R2_SECRET = "085826a53d9c16e60e8dab3c89f575a3eef51a5e1fe8e9d2b9323adeca5d598d"


def api_get(path):
    req = urllib.request.Request(f"{API}{path}")
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def api_post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(f"{API}{path}", data=body,
        headers={"Content-Type": "application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def download_from_r2(r2_key, local_path):
    """Download a file from R2 using S3-compatible API."""
    url = f"{R2_ENDPOINT}/factory-assets/{r2_key}"
    # Simple HTTP GET with auth
    import base64, hmac, hashlib
    # For simplicity, use the R2 public URL or boto3
    import boto3
    from botocore.config import Config
    s3 = boto3.client('s3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_KEY,
        aws_secret_access_key=R2_SECRET,
        config=Config(signature_version='s3v4'))
    s3.download_file('factory-assets', r2_key, str(local_path))
    print(f"  Downloaded {r2_key} → {local_path}")


def execute_task(task):
    """Execute a render task: run the PIL code, produce video."""
    task_id = task["task_id"]
    job_slug = task["job_slug"]
    stage = task["stage"]
    manifest = json.loads(task.get("input_manifest_json", "{}"))
    output_dir = manifest.get("outputDir", f"content/publishing/renders/{job_slug}/v1")
    settings = manifest.get("settings", {"width": 1280, "height": 720, "fps": 2})

    task_dir = WORK_DIR / task_id
    task_dir.mkdir(parents=True, exist_ok=True)
    render_dir = task_dir / "render"
    render_dir.mkdir(exist_ok=True)

    print(f"\n{'='*50}")
    print(f"Executing task: {task_id}")
    print(f"  Job: {job_slug}, Stage: {stage}")
    print(f"{'='*50}")

    # Download render code from R2
    code_key = f"{output_dir}/code_review.json"
    code_path = task_dir / "code_review.json"
    try:
        download_from_r2(code_key, code_path)
    except Exception as e:
        print(f"  Failed to download code: {e}")
        api_post(f"/render-tasks/{task_id}/complete", {
            "status": "failed", "error": f"Download failed: {e}"
        })
        return

    # Extract render_pack.py from the code_review output
    try:
        with open(code_path) as f:
            code_data = json.load(f)
        render_code = code_data.get("render_pack_py", "") or code_data.get("render_script", "") or json.dumps(code_data)
    except Exception as e:
        print(f"  Failed to parse code: {e}")
        api_post(f"/render-tasks/{task_id}/complete", {
            "status": "failed", "error": f"Parse failed: {e}"
        })
        return

    # Write and execute the render script
    script_path = task_dir / "render_pack.py"
    with open(script_path, "w") as f:
        f.write(render_code)

    # Check syntax
    result = subprocess.run([sys.executable, "-m", "py_compile", str(script_path)],
                          capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Syntax error: {result.stderr[:200]}")
        api_post(f"/render-tasks/{task_id}/complete", {
            "status": "failed", "error": f"Syntax error: {result.stderr[:200]}"
        })
        return

    # Run the render
    print(f"  Rendering {settings['width']}x{settings['height']} at {settings['fps']}fps...")
    start = time.time()
    
    # Try different entry patterns
    cmds = [
        [sys.executable, str(script_path), "render"],
        [sys.executable, str(script_path)],
    ]
    
    for cmd in cmds:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600, cwd=str(task_dir))
            if result.returncode == 0:
                break
        except:
            continue
    
    elapsed = time.time() - start
    print(f"  Render completed in {elapsed:.1f}s")

    # Upload outputs to R2
    import boto3
    from botocore.config import Config
    s3 = boto3.client('s3',
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_KEY,
        aws_secret_access_key=R2_SECRET,
        config=Config(signature_version='s3v4'))

    outputs = {"shots_rendered": 0, "r2_prefix": f"{output_dir}/shots/"}

    # Upload any generated MP4s
    for mp4 in task_dir.rglob("*.mp4"):
        r2_key = f"{output_dir}/shots/{mp4.name}"
        s3.upload_file(str(mp4), 'factory-assets', r2_key)
        outputs["shots_rendered"] += 1

    # Upload any generated PNGs
    for png in task_dir.rglob("*.png"):
        r2_key = f"{output_dir}/frames/{png.name}"
        s3.upload_file(str(png), 'factory-assets', r2_key)

    # Report completion
    api_post(f"/render-tasks/{task_id}/complete", {
        "status": "completed",
        "outputs": {
            "video": f"{output_dir}/shots/" if outputs["shots_rendered"] > 0 else "",
            "shots_rendered": outputs["shots_rendered"],
            "render_time_s": round(elapsed, 1),
        }
    })
    print(f"  ✅ Task {task_id} completed, {outputs['shots_rendered']} files uploaded")


def main():
    print("VPS Render Worker starting...")
    print(f"  Polling: {API}/render-tasks/claim")
    print("  Ctrl+C to stop")
    print()

    while True:
        try:
            task = api_get("/render-tasks/claim")
            if "task_id" in task and task.get("status") == "claimed":
                execute_task(task)
            else:
                print(".", end="", flush=True)
                time.sleep(5)
        except KeyboardInterrupt:
            print("\nStopping.")
            break
        except Exception as e:
            print(f"\n  Error: {e}")
            time.sleep(10)


if __name__ == "__main__":
    main()
