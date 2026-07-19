import type { APIRoute } from 'astro';
import { healthCheckSubmission, formatSubmissionReference } from '@vmd/schema';
import { track } from '@vmd/analytics';
import { PRACTICE } from '@vmd/config';
import { sendTransactional } from '@vmd/email';
import { getCrmProvider } from '@vmd/crm';
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
export const POST: APIRoute = async ({ request }) => {
  // 1 — Validate the full submission (country/nationality/etc. required).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid-json' }, 400);
  }
  const parsed = healthCheckSubmission.safeParse(body);
  if (!parsed.success) {
    return json(
      { ok: false, error: 'validation', fields: parsed.error.flatten().fieldErrors },
      422,
    );
  }
  const data = parsed.data;

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
    const adminTo = env.ADMIN_NOTIFICATION_EMAIL || PRACTICE.contact.email;
    await Promise.allSettled([
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
    headers: { 'content-type': 'application/json' },
  });
}
