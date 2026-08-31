import type { APIRoute } from 'astro';
import { secondOpinionIntake, scoreLead, formatSubmissionReference } from '@vmd/schema';
import { rateLimit, verifyTurnstile } from '@vmd/forms';
import { sendTransactional } from '@vmd/email';
import { PRACTICE } from '@vmd/config';
import { createLead } from '../../lib/cms.ts';

export const prerender = false;
const env = import.meta.env;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const raw = (body ?? {}) as Record<string, unknown>;
  if (raw.company) return json({ ok: true }); // honeypot

  const parsed = secondOpinionIntake.safeParse(body);
  if (!parsed.success) return json({ ok: false, fieldErrors: fieldErrs(parsed.error.issues) }, 422);

  const okHuman = await verifyTurnstile(
    raw.turnstileToken as string | undefined,
    env.TURNSTILE_SECRET_KEY,
    clientAddress,
  );
  if (!okHuman) return json({ ok: false, error: 'Verification failed' }, 400);

  const underLimit = await rateLimit(`so:${clientAddress}`, 5, 60, {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!underLimit) return json({ ok: false, error: 'Too many requests' }, 429);

  const source = 'second-opinion' as const;
  const now = new Date();
  const submissionId = formatSubmissionReference(now, referenceSequence());
  const lead = {
    source,
    submissionId,
    score: scoreLead(source),
    firstName: parsed.data.firstName,
    email: parsed.data.email,
    mobile: parsed.data.mobile,
    message: parsed.data.message,
    healthCheck: parsed.data,
  };
  const stored = env.PAYLOAD_API_KEY ? await createLead(lead, env.PAYLOAD_API_KEY) : null;
  if (env.PAYLOAD_API_KEY && !stored)
    console.error('[second-opinion] createLead failed — lead not saved to CMS', { submissionId });

  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL) {
    const postmark = { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL };
    const cmsBase = env.PUBLIC_CMS_URL || '';
    const adminUrl = stored && cmsBase ? `${cmsBase}/admin/collections/leads/${stored.id}` : '';
    await sendTransactional(
      {
        to: PRACTICE.contact.email,
        template: 'lead-internal-notification',
        model: { ...lead, receivedAt: now.toISOString(), adminUrl },
      },
      postmark,
    ).catch((e) => console.error('[second-opinion] admin notification email failed:', e));
    await sendTransactional(
      { to: parsed.data.email, template: 'second-opinion-received', model: parsed.data },
      postmark,
    ).catch((e) => console.error('[second-opinion] client confirmation email failed:', e));
  } else {
    console.warn('[second-opinion] Postmark not configured — no email sent');
  }
  return json({ ok: true });
};
/** Cryptographically-random 0–999999 for the human-friendly reference suffix. */
function referenceSequence(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] ?? 0) % 1_000_000;
}
function fieldErrs(issues: { path: (string | number)[]; message: string }[]) {
  const o: Record<string, string> = {};
  for (const i of issues) o[i.path.join('.')] = i.message;
  return o;
}
function json(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
