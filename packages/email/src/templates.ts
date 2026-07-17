import type { TransactionalTemplate } from './index.ts';
/** Minimal, legible templates. Confirmation carries the 6-doc prep checklist (§9.4). */
export function renderTemplate(t: TransactionalTemplate, m: Record<string, unknown>) {
  const name = String(m.firstName ?? 'there');
  switch (t) {
    case 'consultation-confirmation':
      return {
        subject: 'Your consultation is confirmed',
        text: `Hi ${name}, your consultation is confirmed. Please bring: passport, current visa, any refusal/decision letters, employment or study documents, English test results, and skills assessment (if any).`,
      };
    case 'health-check-result':
      return {
        subject: 'Your Visa Health Check result',
        text: `Hi ${name}, your indicative result is attached. This is general information, not migration advice.`,
      };
    case 'second-opinion-received':
      return {
        subject: 'We received your Second Opinion request',
        text: `Hi ${name}, we've received your request and will respond within one business day.`,
      };
    case 'lead-internal-notification':
      return {
        subject: `New lead: ${String(m.source ?? 'enquiry')}`,
        text: `New ${String(m.source)} lead from ${name} (${String(m.email)}). Score ${String(m.score ?? '')}.`,
      };
    case 'guide-download':
      return {
        subject: 'Your guide is ready',
        text: `Hi ${name}, your guide download link is enclosed.`,
      };
  }
}
