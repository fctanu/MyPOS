export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/nvidia", "");
  const target = `https://integrate.api.nvidia.com/v1${path}`;

  const body = await request.text();

  const res = await fetch(target, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("Authorization") ?? "",
    },
    body: body || undefined,
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
