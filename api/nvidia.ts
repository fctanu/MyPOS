import type { VercelRequest, VercelResponse } from "@vercel/node";

const TARGET = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const body = typeof request.body === "string" ? request.body : JSON.stringify(request.body);

  const res = await fetch(TARGET, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: (request.headers.authorization as string) ?? "",
    },
    body: body || undefined,
  });

  const text = await res.text();

  response.status(res.status);
  res.headers.forEach((value, key) => {
    if (!["content-encoding", "content-length", "transfer-encoding"].includes(key)) {
      response.setHeader(key, value);
    }
  });
  response.send(text);
}
