import type { APIRoute } from 'astro';
import { validateLead, verifyTurnstile, rateLimit } from '@vmd/forms';
import { scoreLead, formatSubmissionReference } from '@vmd/schema';
import { sendTransactional } from '@vmd/email';
import { track } from '@vmd/analytics';
import { PRACTICE } from '@vmd/config';
import { createLead } from '../../lib/cms.ts';

export const prerender = false;
const env = import.meta.env;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'Invalid body' }, 400);
  }

  if (body.company) return json({ ok: true, id: 'ignored' }); // honeypot

  const result = validateLead(body);
  if (!result.ok) return json({ ok: false, fieldErrors: result.fieldErrors }, 422);

  const okHuman = await verifyTurnstile(
    body.turnstileToken as string | undefined,
    env.TURNSTILE_SECRET_KEY,
    clientAddress,
  );
  if (!okHuman) return json({ ok: false, error: 'Verification failed' }, 400);

  const underLimit = await rateLimit(`lead:${clientAddress}`, 5, 60, {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!underLimit) return json({ ok: false, error: 'Too many requests' }, 429);

  const now = new Date();
  const submissionId = formatSubmissionReference(now, referenceSequence());
  const lead = { ...result.data, submissionId, score: scoreLead(result.data.source) };

  // Store first so the notification email can link straight to the saved lead.
  const stored = env.PAYLOAD_API_KEY ? await createLead(lead, env.PAYLOAD_API_KEY) : null;
  if (env.PAYLOAD_API_KEY && !stored)
    console.error('[lead] createLead failed — lead not saved to CMS', { submissionId });

  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL) {
    const cmsBase = env.PUBLIC_CMS_URL || '';
    const adminUrl = stored && cmsBase ? `${cmsBase}/admin/collections/leads/${stored.id}` : '';
    await sendTransactional(
      {
        to: PRACTICE.contact.email,
        template: 'lead-internal-notification',
        model: { ...lead, receivedAt: now.toISOString(), adminUrl },
      },
      { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL },
    ).catch((e) => console.error('[lead] admin notification email failed:', e));
  } else {
    console.warn(
      '[lead] Postmark not configured (POSTMARK_SERVER_TOKEN / POSTMARK_FROM_EMAIL) — no email sent',
    );
  }
  await track(
    {
      event: 'consultation_requested',
      consent: lead.marketingConsent,
      params: { source: lead.source },
    },
    {
      ga4: env.GA4_MEASUREMENT_ID
        ? { measurementId: env.GA4_MEASUREMENT_ID, apiSecret: env.GA4_API_SECRET ?? '' }
        : undefined,
      plausible: { domain: env.PLAUSIBLE_DOMAIN ?? PRACTICE.domain },
    },
  ).catch(() => {});

  return json({ ok: true });
};
/** Cryptographically-random 0–999999 for the human-friendly reference suffix. */
function referenceSequence(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] ?? 0) % 1_000_000;
}
function json(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
