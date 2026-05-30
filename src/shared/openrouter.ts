export async function callOpenRouterStream(
  apiKey: string,
  messages: { role: string; content: string }[],
  onChunk: (fullText: string) => void,
): Promise<string> {
  const response = await fetch(
    "/api/nvidia",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        stream: true,
        temperature: 1,
        top_p: 1,
        max_tokens: 4096,
      }),
    },
  );

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      /* ignore */
    }
    throw new Error(
      `AI API error ${response.status}: ${errorText || response.statusText}`,
    );
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        if (!parsed.choices?.length) continue;
        const delta = parsed.choices[0].delta;
        if (delta.content) {
          fullText += delta.content;
          onChunk(fullText);
        }
      } catch {
        /* skip unparseable lines */
      }
    }
  }

  return fullText;
}
