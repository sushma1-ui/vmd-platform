import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCrmProvider } from './index.ts';
import { HubSpotCrmProvider } from './adapters/hubspot.ts';

const contact = {
  email: 'asha@example.com',
  firstName: 'Asha',
  leadSource: 'health-check',
} as const;

test('defaults to the manual (no-op) provider without credentials', async () => {
  const crm = getCrmProvider();
  assert.equal(crm.id, 'manual');
  const r = await crm.upsertContactFromLead(contact);
  assert.deepEqual(r, { ok: true, provider: 'manual', contactId: null, skipped: true });
});

test('HubSpot requested but no token → safe fallback to manual (never throws)', () => {
  assert.equal(getCrmProvider({ provider: 'hubspot' }).id, 'manual');
});

test('selects HubSpot when a token is present', () => {
  assert.equal(getCrmProvider({ hubspotAccessToken: 'tok' }).id, 'hubspot');
});

test('HubSpot adapter upserts a contact by email (idempotent), no real creds', async () => {
  const calls: Array<{ url: string; body: { inputs: Array<Record<string, unknown>> } }> = [];
  const provider = new HubSpotCrmProvider({ accessToken: 'tok', baseUrl: 'https://hub.test' });
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ results: [{ id: '123' }] }), { status: 200 });
  }) as typeof fetch;
  try {
    const r = await provider.upsertContactFromLead({
      ...contact,
      country: 'India',
      submissionId: 'VHC-1',
    });
    assert.equal(r.ok, true);
    assert.equal(r.ok && r.contactId, '123');
    assert.match(calls[0]!.url, /crm\/v3\/objects\/contacts\/batch\/upsert$/);
    const input = calls[0]!.body.inputs[0]!;
    assert.equal(input.idProperty, 'email');
    const props = input.properties as Record<string, string>;
    assert.equal(props.email, 'asha@example.com');
    assert.equal(props.lead_source, 'health-check');
    assert.equal(props.submission_id, 'VHC-1');
    assert.equal(props.country, 'India');
  } finally {
    globalThis.fetch = original;
  }
});

test('HubSpot adapter returns a typed error instead of throwing on API failure', async () => {
  const provider = new HubSpotCrmProvider({ accessToken: 'tok', baseUrl: 'https://hub.test' });
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response('unauthorized', { status: 401 })) as typeof fetch;
  try {
    const r = await provider.upsertContactFromLead(contact);
    assert.equal(r.ok, false);
    assert.equal(r.ok === false && r.provider, 'hubspot');
  } finally {
    globalThis.fetch = original;
  }
});
