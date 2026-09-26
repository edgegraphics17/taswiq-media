/**
 * Minimaler In-Memory-Rate-Limiter (Sliding Window pro IP).
 * Reicht gegen Doppelklicks & einfache Bots. Für mehrere Instanzen/Edge
 * auf Upstash Redis (@upstash/ratelimit) umstellen – gleiche Signatur.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear(); // Speicher-Schutz
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
