import { renderTemplate } from './templates.ts';

export type TransactionalTemplate =
  | 'health-check-result'
  | 'health-check-received'
  | 'consultation-confirmation'
  | 'second-opinion-received'
  | 'lead-internal-notification'
  | 'guide-download';

export interface SendInput {
  to: string;
  template: TransactionalTemplate;
  model: Record<string, unknown>;
}
export interface PostmarkConfig {
  serverToken: string;
  from: string;
}

/** ONE public API. Postmark under the hood; swap providers without touching callers. */
export async function sendTransactional(
  input: SendInput,
  config: PostmarkConfig,
): Promise<{ id: string }> {
  const { subject, text } = renderTemplate(input.template, input.model);
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'X-Postmark-Server-Token': config.serverToken,
    },
    body: JSON.stringify({
      From: config.from,
      To: input.to,
      Subject: subject,
      TextBody: text,
      MessageStream: 'outbound',
    }),
  });
  if (!res.ok) throw new Error(`Postmark ${res.status}`);
  const data = (await res.json()) as { MessageID: string };
  return { id: data.MessageID };
}
