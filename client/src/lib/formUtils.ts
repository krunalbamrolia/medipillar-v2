/** Extract readable message from apiRequest errors (e.g. `409: {"error":"..."}`). */
export function parseApiError(message: string): string {
  const jsonStart = message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart)) as { error?: string };
      if (parsed.error) return parsed.error;
    } catch {
      /* use fallback */
    }
  }
  return message.replace(/^\d+:\s*/, "");
}

export function cleanFormData<T extends Record<string, unknown>>(data: T): T {
  const cleaned = { ...data };
  for (const key in cleaned) {
    if (cleaned[key] === "") {
      (cleaned as Record<string, unknown>)[key] = null;
    }
  }
  return cleaned;
}
