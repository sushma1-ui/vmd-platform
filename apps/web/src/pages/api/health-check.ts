import type { APIRoute } from 'astro';
import { healthCheckSubmission, scoreLead } from '@vmd/schema';
import { track } from '@vmd/analytics';
import { PRACTICE } from '@vmd/config';
import { createLead } from '../../lib/cms.ts';

export const prerender = false;
const env = import.meta.env;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }
  const parsed = healthCheckSubmission.partial().safeParse(body);
  if (!parsed.success) return json({ ok: false }, 422);

  const source = 'health-check' as const;
  const lead = { source, score: scoreLead(source), firstName: parsed.data.firstName ?? '', email: parsed.data.email ?? '', mobile: parsed.data.mobile, situation: parsed.data.situation, healthCheck: parsed.data };
  if (env.PAYLOAD_API_KEY && lead.email) await createLead(lead, env.PAYLOAD_API_KEY);
  await track({ event: 'health_check_complete', consent: true, params: { situation: String(parsed.data.situation ?? '') } }, {
    ga4: env.GA4_MEASUREMENT_ID ? { measurementId: env.GA4_MEASUREMENT_ID, apiSecret: env.GA4_API_SECRET ?? '' } : undefined,
    plausible: { domain: env.PLAUSIBLE_DOMAIN ?? PRACTICE.domain },
  }).catch(() => {});
  return json({ ok: true });
};
function json(d: unknown, status = 200) { return new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json' } }); }
