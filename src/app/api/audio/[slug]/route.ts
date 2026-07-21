// @ts-nocheck
export async function GET(req, { params }) {
  const slug = (await params).slug;
  const env = process.env as any;
  const bucket = env.ATLAS_R2;

  if (!bucket) {
    return new Response("R2 not available", { status: 501 });
  }

  const key = `audio/${slug}`;
  const obj = await bucket.get(key);

  if (!obj) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(obj.body, { headers });
}

export const runtime = "edge";
