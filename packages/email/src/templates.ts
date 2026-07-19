import type { TransactionalTemplate } from './index.ts';
import { PRACTICE } from '@vmd/config';

/** RMA + MARN, always paired (compliance). Used in client-facing signatures. */
const SIGNATURE = `— ${PRACTICE.legalName}\nRegistered Migration Agent (RMA): ${PRACTICE.principal.name} · MARN ${PRACTICE.principal.marn}`;

function str(v: unknown): string {
  return v == null ? '' : String(v);
}
function line(label: string, v: unknown): string {
  const value = str(v);
  return value ? `  ${label}: ${value}\n` : '';
}
/** Format arbitrary Health Check / attribution answers as readable lines. */
function formatAnswers(answers: unknown): string {
  if (!answers || typeof answers !== 'object') return '  (none captured)\n';
  const rows = Object.entries(answers as Record<string, unknown>)
    .filter(([, v]) => v != null && v !== '' && typeof v !== 'object')
    .map(([k, v]) => `  ${k}: ${str(v)}`);
  return rows.length ? `${rows.join('\n')}\n` : '  (none captured)\n';
}

/**
 * Transactional templates. Text bodies — legible and provider-agnostic.
 *
 * The Visa Health Check is lead capture, NOT assessment: the client email
 * confirms receipt and explicitly states that no migration advice has been given
 * yet. The admin email carries the full submission for a human to review.
 */
export function renderTemplate(t: TransactionalTemplate, m: Record<string, unknown>) {
  const name = str(m.firstName) || 'there';
  switch (t) {
    case 'health-check-received':
      return {
        subject: 'Thank you for completing your Free Visa Health Check',
        text:
          `Hi ${name},\n\n` +
          `Thank you for completing your Free Visa Health Check.\n\n` +
          `Our registered migration team will carefully review your information. ` +
          `You will receive a response via email within 1–2 business days.\n\n` +
          `Please note: no migration advice has been provided yet. This message ` +
          `only confirms that we have received your details and your review has started.\n\n` +
          (str(m.submissionId) ? `Your reference: ${str(m.submissionId)}\n\n` : '') +
          SIGNATURE,
      };
    case 'lead-internal-notification':
      return {
        subject: `New Visa Health Check lead — ${name}${
          str(m.submissionId) ? ` (${str(m.submissionId)})` : ''
        }`,
        text:
          `New submission from the ${str(m.source) || 'website'}.\n\n` +
          line('Reference', m.submissionId) +
          line('Received', m.receivedAt) +
          line('Source', m.source) +
          line('Lead score', m.score) +
          `\nClient\n` +
          line('Name', m.firstName) +
          line('Email', m.email) +
          line('Phone', m.mobile) +
          line('Country of residence', m.country) +
          line('Nationality', m.nationality) +
          line('Current visa', m.currentVisa) +
          line('Situation', m.situation) +
          line('Preferred contact', m.preferredContact) +
          `\nQuestionnaire\n` +
          formatAnswers(m.healthCheck) +
          `\nAttribution\n` +
          formatAnswers(m.attribution) +
          `\nReview and action this lead in the CMS.`,
      };
    case 'consultation-confirmation':
      return {
        subject: 'Your consultation is confirmed',
        text: `Hi ${name}, your consultation is confirmed. Please bring: passport, current visa, any refusal/decision letters, employment or study documents, English test results, and skills assessment (if any).`,
      };
    case 'health-check-result':
      // Legacy template retained for compatibility. The current flow uses
      // 'health-check-received' and never emails an assessment/result.
      return {
        subject: 'We received your Visa Health Check',
        text: `Hi ${name}, we've received your Visa Health Check and our team will be in touch within 1–2 business days. No migration advice has been provided yet.`,
      };
    case 'second-opinion-received':
      return {
        subject: 'We received your Second Opinion request',
        text: `Hi ${name}, we've received your request and will respond within one business day.`,
      };
    case 'guide-download':
      return {
        subject: 'Your guide is ready',
        text: `Hi ${name}, your guide download link is enclosed.`,
      };
  }
}
