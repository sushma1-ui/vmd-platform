import type { APIRoute } from 'astro';
import { secondOpinionIntake, scoreLead } from '@vmd/schema';
import { rateLimit } from '@vmd/forms';
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
  const parsed = secondOpinionIntake.safeParse(body);
  if (!parsed.success) return json({ ok: false, fieldErrors: fieldErrs(parsed.error.issues) }, 422);

  const underLimit = await rateLimit(`so:${clientAddress}`, 5, 60, {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!underLimit) return json({ ok: false, error: 'Too many requests' }, 429);

  const source = 'second-opinion' as const;
  const lead = {
    source,
    score: scoreLead(source),
    firstName: parsed.data.firstName,
    email: parsed.data.email,
    mobile: parsed.data.mobile,
    message: parsed.data.message,
    healthCheck: parsed.data,
  };
  if (env.PAYLOAD_API_KEY) await createLead(lead, env.PAYLOAD_API_KEY);
  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL) {
    await sendTransactional(
      { to: PRACTICE.contact.email, template: 'lead-internal-notification', model: lead },
      { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL },
    ).catch(() => {});
    await sendTransactional(
      { to: parsed.data.email, template: 'second-opinion-received', model: parsed.data },
      { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL },
    ).catch(() => {});
  }
  return json({ ok: true });
};
function fieldErrs(issues: { path: (string | number)[]; message: string }[]) {
  const o: Record<string, string> = {};
  for (const i of issues) o[i.path.join('.')] = i.message;
  return o;
}
function json(d: unknown, status = 200) {
  return new Response(JSON.stringify(d), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
