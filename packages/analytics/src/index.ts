export type AnalyticsEvent =
  | 'health_check_start'
  | 'health_check_step'
  | 'health_check_complete'
  | 'consultation_requested'
  | 'second_opinion_submitted'
  | 'guide_download'
  | 'newsletter_signup';

export interface TrackInput {
  event: AnalyticsEvent;
  params?: Record<string, string | number | boolean>;
  consent: boolean;
}
export interface AnalyticsConfig {
  ga4?: { measurementId: string; apiSecret: string; clientId?: string };
  plausible?: { domain: string; url?: string };
}

/** Consent-aware. Server-side GA4 (Measurement Protocol) + privacy-friendly Plausible. */
export async function track(input: TrackInput, config: AnalyticsConfig): Promise<void> {
  if (!input.consent) return;
  const tasks: Promise<unknown>[] = [];
  if (config.ga4) {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${config.ga4.measurementId}&api_secret=${config.ga4.apiSecret}`;
    tasks.push(
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          client_id: config.ga4.clientId ?? 'server',
          events: [{ name: input.event, params: input.params ?? {} }],
        }),
      }).catch(() => undefined),
    );
  }
  if (config.plausible) {
    tasks.push(
      fetch(config.plausible.url ?? 'https://plausible.io/api/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: input.event,
          domain: config.plausible.domain,
          url: `https://${config.plausible.domain}/`,
        }),
      }).catch(() => undefined),
    );
  }
  await Promise.all(tasks);
}
