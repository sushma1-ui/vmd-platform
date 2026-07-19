/**
 * @vmd/crm — public API.
 *
 * Consumers import { getCrmProvider } and the port types; they must not import a
 * concrete adapter directly — that is what keeps the CRM swappable. Adding real
 * HubSpot credentials to the environment activates HubSpot with NO structural
 * change to callers (the lead pipeline stays identical).
 */
export type { CrmProvider, CrmProviderId, CrmContact, CrmResult, LifecycleStage } from './types.ts';
export type { HubSpotConfig } from './adapters/hubspot.ts';

import type { CrmProvider } from './types.ts';
import { ManualCrmProvider } from './adapters/manual.ts';
import { HubSpotCrmProvider } from './adapters/hubspot.ts';

export interface CrmConfig {
  /** Explicit provider selection. Defaults to auto: HubSpot iff a token exists. */
  provider?: 'manual' | 'hubspot';
  hubspotAccessToken?: string;
}

/**
 * Factory. Selects the CRM adapter from (env-derived) config:
 *   - a HubSpot token present (or provider === 'hubspot' with a token) → HubSpot
 *   - otherwise → the no-op manual adapter (secure-by-default; no external calls)
 *
 * If HubSpot is requested but no token is configured, it falls back to manual
 * rather than throwing, so a misconfiguration can never break the submission path.
 */
export function getCrmProvider(config: CrmConfig = {}): CrmProvider {
  const wantsHubSpot =
    config.provider === 'hubspot' ||
    (config.provider == null && Boolean(config.hubspotAccessToken));

  if (wantsHubSpot && config.hubspotAccessToken) {
    return new HubSpotCrmProvider({ accessToken: config.hubspotAccessToken });
  }
  return new ManualCrmProvider();
}
