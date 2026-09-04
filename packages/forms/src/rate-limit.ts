/**
 * Rate limiting for the lead-generation endpoints.
 *
 * Two layers, and the request must pass BOTH:
 *   1. A per-instance in-memory sliding window that ALWAYS applies — so a rapid
 *      burst from one IP is throttled even when Upstash is not configured and even
 *      if Upstash has a transient outage. Serverless instances are ephemeral and a
 *      burst can be spread across several of them, so this is a backstop, not the
 *      primary control — but it means the floor is never "no limit at all".
 *   2. A distributed fixed-window on Upstash Redis (REST) when configured, which is
 *      accurate across every instance/region.
 *
 * Design choice: on an Upstash error we fall back to the in-memory result rather
 * than failing fully open, so an infra hiccup degrades protection instead of
 * removing it — while still never hard-blocking a genuine lead on a Redis outage.
 */
export interface UpstashConfig {
  url?: string;
  token?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}
// Module-scoped, so it survives across requests on a warm serverless instance.
const memory = new Map<string, Bucket>();

/** Occasionally drop expired buckets so the map can't grow without bound. */
function sweep(now: number): void {
  if (memory.size < 5000) return;
  for (const [k, b] of memory) if (b.resetAt <= now) memory.delete(k);
}

/** Per-instance fixed window. Returns true while at/under the limit. */
function memoryLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const b = memory.get(key);
  if (!b || b.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    sweep(now);
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
  cfg: UpstashConfig,
): Promise<boolean> {
  // Layer 1 — always on, even with no external config.
  const memOk = memoryLimit(key, limit, windowSec);

  // No Upstash configured: the in-memory backstop is the whole answer.
  if (!cfg.url || !cfg.token) return memOk;

  // Layer 2 — distributed fixed window.
  const headers = { authorization: `Bearer ${cfg.token}` };
  try {
    const incr = await fetch(`${cfg.url}/incr/${encodeURIComponent(key)}`, { headers });
    const { result } = (await incr.json()) as { result: number };
    if (result === 1)
      await fetch(`${cfg.url}/expire/${encodeURIComponent(key)}/${windowSec}`, { headers });
    return memOk && result <= limit;
  } catch {
    // Redis hiccup — degrade to the in-memory result, not fully open.
    return memOk;
  }
}
