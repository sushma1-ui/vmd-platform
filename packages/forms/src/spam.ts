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

export interface TurnstileGate {
  /** The token submitted by the client (cf-turnstile-response). */
  token: string | undefined;
  /** TURNSTILE_SECRET_KEY — server-only; presence means "we can verify". */
  secret: string | undefined;
  /** PUBLIC_TURNSTILE_SITE_KEY — presence means "the widget is live for users". */
  siteKey?: string | undefined;
  remoteIp?: string;
  expectedHostname?: string;
}

/**
 * The SINGLE human-check decision every public endpoint uses, so all forms enforce
 * Turnstile identically — no form is protected merely because another one is.
 *
 *   - secret set                   → the token MUST verify; a missing, invalid,
 *                                    expired or reused token is REJECTED (fail closed).
 *   - secret unset but siteKey set → MISCONFIGURATION: the widget is live (users are
 *                                    solving challenges) but the server has no secret
 *                                    to verify with. REJECT rather than allow a
 *                                    tokenless bypass — otherwise a bot skips the check
 *                                    simply by not sending a token. (fail closed)
 *   - neither set                  → Turnstile is not configured (local/dev/pre-launch).
 *                                    Allow; honeypot, validation and rate limiting still
 *                                    apply. Setting BOTH keys switches on enforcement.
 */
export async function passesTurnstile(gate: TurnstileGate): Promise<boolean> {
  if (turnstileConfigured(gate.secret)) {
    return verifyTurnstile(gate.token, gate.secret, {
      remoteIp: gate.remoteIp,
      expectedHostname: gate.expectedHostname,
    });
  }
  if (typeof gate.siteKey === 'string' && gate.siteKey.length > 0) {
    console.error(
      '[turnstile] PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY is missing — ' +
        'rejecting the submission to avoid a verification bypass. Set the secret to enable verification.',
    );
    return false;
  }
  return true;
}

/**
 * True if any hidden honeypot field was filled. Humans never see these fields, so a
 * non-empty value is a bot. Shared so every form drops honeypot hits the same way.
 */
export function honeypotTripped(
  body: Record<string, unknown> | null | undefined,
  ...fields: string[]
): boolean {
  if (!body) return false;
  return fields.some((f) => {
    const v = body[f];
    return typeof v === 'string' ? v.trim() !== '' : v != null && v !== false;
  });
}
