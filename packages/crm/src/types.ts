/**
 * The CRM port. The lead pipeline depends on this interface, never a concrete
 * provider, so HubSpot (or any CRM) drops in by adding an adapter and registering
 * it in the factory. See docs/ADR/0005-crm-provider-abstraction.md.
 */

export type LifecycleStage =
  | 'subscriber'
  | 'lead'
  | 'marketingqualifiedlead'
  | 'salesqualifiedlead'
  | 'opportunity'
  | 'customer';

export type CrmProviderId = 'manual' | 'hubspot';

/** A contact to create/update in the CRM, derived from a captured lead. */
export interface CrmContact {
  /** Our stable reference — an idempotency hint, and stored on the contact. */
  submissionId?: string;
  email: string;
  firstName: string;
  phone?: string;
  country?: string;
  nationality?: string;
  currentVisa?: string;
  situation?: string;
  /** Where the lead came from, e.g. 'health-check'. */
  leadSource: string;
  lifecycleStage?: LifecycleStage;
  /** Human-readable note (e.g. a questionnaire summary). */
  notes?: string;
  /** Structured questionnaire answers. */
  answers?: Record<string, unknown>;
  /** Marketing attribution (UTM, referrer, ...). */
  attribution?: Record<string, unknown>;
}

export type CrmResult =
  | { ok: true; provider: CrmProviderId; contactId: string | null; skipped: boolean }
  | { ok: false; provider: CrmProviderId; error: string };

export interface CrmProvider {
  readonly id: CrmProviderId;
  /**
   * Idempotently upsert a contact from a lead. MUST NOT throw for expected
   * conditions (e.g. missing credentials, provider downtime) — it returns a typed
   * result so a CRM problem can never break the client's submission flow.
   */
  upsertContactFromLead(contact: CrmContact): Promise<CrmResult>;
}
