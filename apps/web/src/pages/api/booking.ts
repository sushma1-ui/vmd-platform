import type { APIRoute } from 'astro';
import { consultationRequest, scoreLead } from '@vmd/schema';
import { getSchedulingProvider } from '@vmd/scheduling';
import { rateLimit, verifyTurnstile } from '@vmd/forms';
import { sendTransactional } from '@vmd/email';
import { createConsultation, patchConsultation, createLead } from '../../lib/cms.ts';

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

  const parsed = consultationRequest.safeParse(body);
  if (!parsed.success) return json({ ok: false, fieldErrors: errs(parsed.error.issues) }, 422);

  const okHuman = await verifyTurnstile(
    raw.turnstileToken as string | undefined,
    env.TURNSTILE_SECRET_KEY,
    clientAddress,
  );
  if (!okHuman) return json({ ok: false, error: 'Verification failed' }, 400);

  if (
    !(await rateLimit(`book:${clientAddress}`, 5, 60, {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }))
  )
    return json({ ok: false, error: 'Too many requests' }, 429);

  const data = parsed.data;
  const apiKey = env.PAYLOAD_API_KEY;

  // 1) Record FIRST — never lose a booking to a provider outage (ADR-0001).
  let recordId = 'pending';
  if (apiKey) {
    const rec = await createConsultation({ ...data, status: 'requested' }, apiKey);
    if (rec) recordId = rec.id;
  }

  // 2) Provider is an integration layer only. Manual adapter for V1.
  const provider = getSchedulingProvider((env.SCHEDULING_PROVIDER as 'manual') ?? 'manual');
  let providerRef: string | null = null;
  try {
    if (data.requestedStartUtc) {
      providerRef = await provider.createAppointment({
        bookingKey: recordId,
        slot: { startUtc: data.requestedStartUtc, endUtc: data.requestedStartUtc },
        attendee: { firstName: data.firstName, email: data.email, mobile: data.mobile },
        timezone: data.timezone,
        notes: data.notes,
      });
    }
  } catch {
    /* record already saved; practice confirms out of band */
  }

  // 3) Reconcile the reference back onto our record.
  if (apiKey && recordId !== 'pending' && providerRef)
    await patchConsultation(recordId, { providerRef }, apiKey);

  // 4) A booking is also a high-value lead.
  if (apiKey)
    await createLead(
      {
        source: 'consultation',
        score: scoreLead('consultation'),
        firstName: data.firstName,
        email: data.email,
        mobile: data.mobile,
      },
      apiKey,
    );

  // 5) Confirmation with the prep checklist (commitment device, §9.4).
  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL)
    await sendTransactional(
      {
        to: data.email,
        template: 'consultation-confirmation',
        model: { firstName: data.firstName },
      },
      { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL },
    ).catch(() => {});

  return json({ ok: true });
};
function errs(issues: { path: (string | number)[]; message: string }[]) {
  const o: Record<string, string> = {};
  for (const i of issues) o[i.path.join('.')] = i.message;
  return o;
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), {
    status: s,
    headers: {
      'content-type': 'application/json',
      ...(s === 200 ? { 'cache-control': 'no-store' } : {}),
    },
  });
}
