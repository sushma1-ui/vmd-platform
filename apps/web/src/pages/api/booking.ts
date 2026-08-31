import type { APIRoute } from 'astro';
import { consultationRequest, scoreLead } from '@vmd/schema';
import { getSchedulingProvider } from '@vmd/scheduling';
import { rateLimit, verifyTurnstile } from '@vmd/forms';
import { sendTransactional } from '@vmd/email';
import { PRACTICE } from '@vmd/config';
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

  // 4) A booking is also a high-value lead. Educational Consultations (the Study in
  //    Australia funnel) are tagged distinctly so that funnel can be measured, and
  //    routed to admissions@ — without changing the general consultation pipeline.
  const isEducational = data.type === 'educational';
  const bookingLeadSource = isEducational ? 'educational-consultation' : 'consultation';
  if (apiKey)
    await createLead(
      {
        source: bookingLeadSource,
        score: scoreLead(bookingLeadSource),
        firstName: data.firstName,
        email: data.email,
        mobile: data.mobile,
      },
      apiKey,
    );

  // 5) Notify the practice (enquiries@) AND confirm to the client with the prep
  //    checklist (commitment device, §9.4).
  if (env.POSTMARK_SERVER_TOKEN && env.POSTMARK_FROM_EMAIL) {
    const postmark = { serverToken: env.POSTMARK_SERVER_TOKEN, from: env.POSTMARK_FROM_EMAIL };
    // Team alert — route educational (Study in Australia) enquiries to admissions@,
    // every other consultation to the general practice inbox.
    await sendTransactional(
      {
        to: isEducational ? PRACTICE.contact.admissionsEmail : PRACTICE.contact.email,
        template: 'lead-internal-notification',
        model: {
          firstName: data.firstName,
          email: data.email,
          mobile: data.mobile,
          source: isEducational ? 'educational consultation booking' : 'consultation booking',
          submissionId: recordId !== 'pending' ? recordId : undefined,
          healthCheck: {
            consultationType: data.type,
            preferredTime: data.requestedStartUtc,
            timezone: data.timezone,
            notes: data.notes,
          },
        },
      },
      postmark,
    ).catch((e) => console.error('[booking] practice notification email failed:', e));
    // Client confirmation.
    await sendTransactional(
      {
        to: data.email,
        template: 'consultation-confirmation',
        model: { firstName: data.firstName },
      },
      postmark,
    ).catch((e) => console.error('[booking] client confirmation email failed:', e));
  } else {
    console.warn('[booking] Postmark not configured — no email sent');
  }

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
      'cache-control': 'no-store',
    },
  });
}
