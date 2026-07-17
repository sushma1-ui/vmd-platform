/** Cloudflare Turnstile verification + honeypot. No SDK; a single fetch. */
export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  ip?: string,
): Promise<boolean> {
  if (!secret) return true; // not configured -> don't block (dev)
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
