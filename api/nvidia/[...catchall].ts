const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/nvidia", "");
  const target = `${NVIDIA_BASE}${path}`;

  const headers = new Headers(request.headers);
  headers.set("host", "integrate.api.nvidia.com");

  const body = await request.text();

  const res = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.get("Authorization") ?? "",
    },
    body: body || undefined,
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
