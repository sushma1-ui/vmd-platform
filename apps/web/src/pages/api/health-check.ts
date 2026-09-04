import type { APIRoute } from 'astro';
import { healthCheckSubmission, formatSubmissionReference } from '@vmd/schema';
import { track } from '@vmd/analytics';
import { PRACTICE } from '@vmd/config';
import { sendTransactional } from '@vmd/email';
import { getCrmProvider } from '@vmd/crm';
import { verifyTurnstile, rateLimit, readJson } from '@vmd/forms';
import { createLead } from '../../lib/cms.ts';

export const prerender = false;
const env = import.meta.env;

/**
 * Free Visa Health Check — LEAD CAPTURE, not assessment.
 *
 * Flow: validate → generate reference → store lead → admin email → client email →
 * upsert CRM contact (when configured) → return success. It never computes or
 * returns visa advice, an eligibility result, a score, or a recommendation.
 *
 * Storage is the system of record; email + CRM are best-effort side effects that
 * never block (or fail) the client's success response.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const read = await readJson(request); // size-limited (32 KB) + JSON-object guard
  if (!read.ok)
    return json(
      { ok: false, error: read.status === 413 ? 'payload-too-large' : 'invalid-json' },
      read.status,
    );
  const body = read.data;
  const raw = body as Record<string, unknown>;

  // 1a — Honeypot: bots fill the hidden "website" field. Drop silently with a
  //      generic success so they learn nothing; no lead, no email, no CRM.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') {
    return json({ ok: true, submissionId: null, stored: false }, 200);
  }

  // 1b — Cloudflare Turnstile. Enforced when TURNSTILE_SECRET_KEY is set; in dev
  //      (no secret) verifyTurnstile returns true so local testing still works.
  const ip =
    clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const human = await verifyTurnstile(
    typeof raw.turnstileToken === 'string' ? raw.turnstileToken : undefined,
    env.TURNSTILE_SECRET_KEY,
    ip,
  );
  if (!human) return json({ ok: false, error: 'verification-failed' }, 403);

  // 1c — Validate the full submission (country/nationality/etc. required).
  const parsed = healthCheckSubmission.safeParse(body);
  if (!parsed.success) {
    return json(
      { ok: false, error: 'validation', fields: parsed.error.flatten().fieldErrors },
      422,
    );
  }
  const data = parsed.data;

  // 1d — Rate limits (fail OPEN if Upstash unconfigured, so a genuine lead is
  //      never lost to an infra hiccup): throttle per IP and per email.
  const upstash = { url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN };
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`hc:ip:${ip}`, 5, 3600, upstash), // 5 / hour / IP
    rateLimit(`hc:email:${data.email}`, 3, 86_400, upstash), // 3 / day / email
  ]);
  if (!ipOk || !emailOk) return json({ ok: false, error: 'rate-limited' }, 429);

  // 2 — Human-friendly, globally-unique reference (uniqueness enforced by the
  //     unique index on leads.submissionId).
  const now = new Date();
  const submissionId = formatSubmissionReference(now, referenceSequence());

  // 3 — Store the lead (server-side, agent API key). createLead returns null on
  //     failure rather than throwing, so email/CRM still capture the lead.
  const lead = {
    source: 'health-check' as const,
    submissionId,
    firstName: data.firstName,
    email: data.email,
    mobile: data.mobile,
    situation: data.situation,
    country: data.country,
    nationality: data.nationality,
    currentVisa: data.currentVisa,
    goal: data.goal,
    healthCheck: data,
    attribution: data.attribution,
    marketingConsent: false,
  };
  const stored = env.PAYLOAD_API_KEY ? await createLead(lead, env.PAYLOAD_API_KEY) : null;

  // 4 + 5 — Admin + client emails (best-effort; never block success).
  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL) {
    const config = { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL };
    // Practice inbox (enquiries@) is the single source of truth for form delivery.
    const adminTo = PRACTICE.contact.email;
    const cmsBase = env.PUBLIC_CMS_URL || '';
    const adminUrl = stored && cmsBase ? `${cmsBase}/admin/collections/leads/${stored.id}` : '';
    const results = await Promise.allSettled([
      sendTransactional(
        {
          to: adminTo,
          template: 'lead-internal-notification',
          model: {
            submissionId,
            receivedAt: now.toISOString(),
            source: 'health-check',
            firstName: data.firstName,
            email: data.email,
            mobile: data.mobile,
            country: data.country,
            nationality: data.nationality,
            currentVisa: data.currentVisa,
            situation: data.situation,
            goal: data.goal,
            preferredContact: data.preferredContact,
            healthCheck: data,
            attribution: data.attribution,
            adminUrl,
          },
        },
        config,
      ),
      sendTransactional(
        {
          to: data.email,
          template: 'health-check-received',
          model: { firstName: data.firstName, submissionId },
        },
        config,
      ),
    ]);
    results.forEach((r, i) => {
      if (r.status === 'rejected')
        console.error(`[health-check] ${i === 0 ? 'admin' : 'client'} email failed:`, r.reason);
    });
  } else {
    console.warn('[health-check] Postmark not configured — no email sent');
  }

  // 6 — CRM upsert. Only calls out when a HubSpot token is configured; otherwise a
  //     no-op. Never throws — a CRM problem cannot break the submission.
  await getCrmProvider({ hubspotAccessToken: env.HUBSPOT_ACCESS_TOKEN }).upsertContactFromLead({
    submissionId,
    email: data.email,
    firstName: data.firstName,
    phone: data.mobile,
    country: data.country,
    nationality: data.nationality,
    currentVisa: data.currentVisa,
    situation: data.situation,
    leadSource: 'health-check',
    lifecycleStage: 'lead',
    answers: data,
    attribution: data.attribution,
  });

  // 7 — Analytics: a capture event only. Never an assessment/result/score.
  await track(
    {
      event: 'health_check_submitted',
      consent: true,
      params: { situation: String(data.situation ?? '') },
    },
    {
      ga4: env.GA4_MEASUREMENT_ID
        ? { measurementId: env.GA4_MEASUREMENT_ID, apiSecret: env.GA4_API_SECRET ?? '' }
        : undefined,
      plausible: { domain: env.PLAUSIBLE_DOMAIN ?? PRACTICE.domain },
    },
  ).catch(() => {});

  // Success carries the reference only — no advice, eligibility, or score.
  return json({ ok: true, submissionId, stored: Boolean(stored) });
};

/** Cryptographically-random 0–999999 for the reference suffix. */
function referenceSequence(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] ?? 0) % 1_000_000;
}

function json(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
