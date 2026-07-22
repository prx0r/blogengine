export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const apiUrl = url.pathname.replace(/^\/api/, '/api');
  const target = new URL(apiUrl + url.search, 'https://studio.tantrafiles.xyz');

  const headers = new Headers(request.headers);
  headers.delete('host');

  const resp = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
  });

  const respHeaders = new Headers(resp.headers);
  respHeaders.set('access-control-allow-origin', '*');

  return new Response(resp.body, {
    status: resp.status,
    headers: respHeaders,
  });
}
