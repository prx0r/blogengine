"""Platinum Factory Controller — Cloudflare Worker"""
import json

async def on_fetch(request, env):
    path = request.url.rstrip("/")
    method = request.method.upper()

    if method == "OPTIONS":
        return Response(204, {"Access-Control-Allow-Origin": "*"})

    if method == "GET" and path.endswith("/"):
        return Response(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }, json.dumps({
            "service": "platinum-factory",
            "version": "0.2.0",
        }))

    if method == "GET" and path.endswith("/jobs"):
        try:
            results = await env.FACTORY_DB.prepare(
                "SELECT slug, current_stage, status FROM jobs ORDER BY created_at DESC"
            ).all()
            jobs = [dict(r) for r in (results.results or [])]
            return Response(200, {"Content-Type": "application/json"}, json.dumps(jobs))
        except Exception as e:
            return Response(500, {"Content-Type": "application/json"}, json.dumps({"error": str(e)}))

    if method == "POST" and path.endswith("/jobs"):
        try:
            body = json.loads(request.body)
            slug = body["slug"]
            await env.FACTORY_DB.prepare(
                "INSERT INTO jobs (slug, current_stage, status) VALUES (?, 'pack_setup', 'active')"
            ).bind(slug).run()
            return Response(200, {"Content-Type": "application/json"}, json.dumps({"slug": slug, "status": "created"}))
        except Exception as e:
            return Response(500, {"Content-Type": "application/json"}, json.dumps({"error": str(e)}))

    return Response(404, {"Content-Type": "application/json"}, json.dumps({"error": "not found"}))


class Response:
    def __init__(self, status, headers, body=""):
        self.status = status
        self.headers = headers
        self.body = body

    def __iter__(self):
        yield self.status
        yield self.headers
        yield self.body
