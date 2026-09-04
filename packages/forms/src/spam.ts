/**
 * Cloudflare Turnstile server-side verification (Siteverify). No SDK; one fetch.
 *
 * Enforcement model:
 *   - secret present  → the token MUST be present and MUST verify. A missing,
 *     invalid, EXPIRED, or REUSED/DUPLICATE token is rejected. Cloudflare itself
 *     invalidates a token after first use and after ~300s (error-code
 *     `timeout-or-duplicate`); we surface those codes in logs for monitoring.
 *   - secret absent   → returns true (cannot verify). This is a DEV convenience;
 *     in production the secret must be set or there is no bot protection. Call
 *     sites should treat an unset secret in production as a misconfiguration
 *     (see turnstileConfigured).
 *
 * An optional expected hostname pins the token to this site so a token minted for
 * another origin can't be replayed here.
 */
export interface TurnstileOptions {
  /** Client IP, forwarded to Cloudflare for its own risk signals. */
  remoteIp?: string;
  /** If set, the verified token's hostname must equal this (defence-in-depth). */
  expectedHostname?: string;
}

interface SiteverifyResponse {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
}

/** True when a secret is configured (i.e. verification can actually happen). */
export function turnstileConfigured(secret: string | undefined): boolean {
  return typeof secret === 'string' && secret.length > 0;
}

export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  options?: string | TurnstileOptions,
): Promise<boolean> {
  // Back-compat: a bare string third arg is the remote IP.
  const opts: TurnstileOptions =
    typeof options === 'string' ? { remoteIp: options } : (options ?? {});

  if (!turnstileConfigured(secret)) return true; // not configured -> don't block (dev)
  if (!token || typeof token !== 'string') return false;

  const body = new URLSearchParams({ secret: secret as string, response: token });
  if (opts.remoteIp) body.set('remoteip', opts.remoteIp);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as SiteverifyResponse;
    if (data.success !== true) {
      // e.g. ['timeout-or-duplicate'] for a reused/expired token, ['invalid-input-response']
      console.warn('[turnstile] verification failed:', data['error-codes'] ?? []);
      return false;
    }
    if (opts.expectedHostname && data.hostname && data.hostname !== opts.expectedHostname) {
      console.warn('[turnstile] hostname mismatch:', data.hostname);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
