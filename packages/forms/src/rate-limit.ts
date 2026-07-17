/** Fixed-window rate limit on Upstash Redis REST. Fails open if unconfigured. */
export interface UpstashConfig {
  url?: string;
  token?: string;
}
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
  cfg: UpstashConfig,
): Promise<boolean> {
  if (!cfg.url || !cfg.token) return true;
  const headers = { authorization: `Bearer ${cfg.token}` };
  try {
    const incr = await fetch(`${cfg.url}/incr/${encodeURIComponent(key)}`, { headers });
    const { result } = (await incr.json()) as { result: number };
    if (result === 1)
      await fetch(`${cfg.url}/expire/${encodeURIComponent(key)}/${windowSec}`, { headers });
    return result <= limit;
  } catch {
    return true; // fail open — never block a genuine lead on infra hiccup
  }
}
