import type { CrmContact, CrmProvider, CrmResult } from '../types.ts';

export interface HubSpotConfig {
  accessToken: string;
  /** Override the API base (used by tests). Defaults to HubSpot production. */
  baseUrl?: string;
}

/**
 * HubSpot CRM adapter. Idempotently upserts a Contact by email via the CRM v3
 * batch upsert endpoint (`idProperty: 'email'`), so re-submissions update the same
 * contact rather than duplicating it.
 *
 * Standard HubSpot properties (email, firstname, phone, country, lifecyclestage)
 * map directly. `lead_source`, `submission_id`, `nationality`, `current_visa` and
 * `situation` are custom contact properties — see the migration plan
 * (docs/ADR/0005) for the properties, the note engagement, and the pipeline steps.
 *
 * It never throws for expected conditions: API/network failures become a typed
 * `{ ok: false }` result so the client submission flow is never blocked.
 */
export class HubSpotCrmProvider implements CrmProvider {
  readonly id = 'hubspot' as const;
  private readonly accessToken: string;
  private readonly baseUrl: string;

  constructor(config: HubSpotConfig) {
    this.accessToken = config.accessToken;
    this.baseUrl = config.baseUrl ?? 'https://api.hubapi.com';
  }

  async upsertContactFromLead(contact: CrmContact): Promise<CrmResult> {
    const properties: Record<string, string> = {
      email: contact.email,
      firstname: contact.firstName,
      lifecyclestage: contact.lifecycleStage ?? 'lead',
      lead_source: contact.leadSource,
    };
    if (contact.phone) properties.phone = contact.phone;
    if (contact.country) properties.country = contact.country;
    if (contact.nationality) properties.nationality = contact.nationality;
    if (contact.currentVisa) properties.current_visa = contact.currentVisa;
    if (contact.situation) properties.situation = contact.situation;
    if (contact.submissionId) properties.submission_id = contact.submissionId;

    try {
      const res = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/batch/upsert`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [{ idProperty: 'email', id: contact.email, properties }],
        }),
      });
      if (!res.ok) {
        return { ok: false, provider: 'hubspot', error: `HubSpot responded ${res.status}` };
      }
      const data = (await res.json()) as { results?: Array<{ id?: string }> };
      return {
        ok: true,
        provider: 'hubspot',
        contactId: data.results?.[0]?.id ?? null,
        skipped: false,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'hubspot',
        error: err instanceof Error ? err.message : 'unknown error',
      };
    }
  }
}
