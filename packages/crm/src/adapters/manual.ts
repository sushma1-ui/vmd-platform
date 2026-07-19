import type { CrmContact, CrmProvider, CrmResult } from '../types.ts';

/**
 * No-op CRM adapter — the secure-by-default provider used whenever no CRM
 * credentials are configured. It performs NO external call (nothing leaves the
 * platform); the team works the lead from the CMS. It returns a "skipped" success
 * so the submission pipeline is never affected by the absence of a CRM.
 */
export class ManualCrmProvider implements CrmProvider {
  readonly id = 'manual' as const;

  async upsertContactFromLead(_contact: CrmContact): Promise<CrmResult> {
    return { ok: true, provider: 'manual', contactId: null, skipped: true };
  }
}
