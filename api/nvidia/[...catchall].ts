export const config = {
  runtime: "nodejs",
};

export async function POST(request: Request) {
  const url = new URL(request.url.replace("/api/nvidia", ""));
  const target = `https://integrate.api.nvidia.com/v1${url.pathname}`;

  const body = await request.text();

  const res = await fetch(target, {
    method: "POST",
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
