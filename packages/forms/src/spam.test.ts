import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passesTurnstile, honeypotTripped } from './spam.ts';

// --- Turnstile Siteverify is mocked so tests never hit the network ---
const realFetch = globalThis.fetch;
function mockSiteverify(success: boolean, errorCodes: string[] = []): void {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ success, 'error-codes': errorCodes }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;
}
function noFetch(): void {
  // Any network call here is a bug: these paths must decide without Siteverify.
  globalThis.fetch = (async () => {
    throw new Error('fetch must not be called');
  }) as typeof fetch;
}
function restoreFetch(): void {
  globalThis.fetch = realFetch;
}

// ---------------- Honeypot ----------------
test('honeypot: a filled hidden field is a bot; empty/whitespace is not', () => {
  assert.equal(honeypotTripped({ company: 'Acme Spam Co' }, 'company'), true);
  assert.equal(honeypotTripped({ website: 'http://spam' }, 'website'), true);
  assert.equal(honeypotTripped({ website: '   ' }, 'website'), false);
  assert.equal(honeypotTripped({}, 'company', 'website'), false);
  assert.equal(honeypotTripped(undefined, 'company'), false);
});

// ---------------- Turnstile: fail closed WHEN configured ----------------
test('missing token is REJECTED when the secret is configured (no network call)', async () => {
  noFetch();
  const ok = await passesTurnstile({
    token: undefined,
    secret: 'test-secret',
    siteKey: 'test-site',
  });
  restoreFetch();
  assert.equal(ok, false);
});

test('invalid token is REJECTED (Siteverify success:false)', async () => {
  mockSiteverify(false, ['invalid-input-response']);
  const ok = await passesTurnstile({
    token: 'bad-token',
    secret: 'test-secret',
    siteKey: 'test-site',
  });
  restoreFetch();
  assert.equal(ok, false);
});

test('reused/expired token is REJECTED (timeout-or-duplicate)', async () => {
  mockSiteverify(false, ['timeout-or-duplicate']);
  const ok = await passesTurnstile({ token: 'used-token', secret: 'test-secret' });
  restoreFetch();
  assert.equal(ok, false);
});

test('valid token PROCEEDS (Siteverify success:true)', async () => {
  mockSiteverify(true);
  const ok = await passesTurnstile({
    token: 'good-token',
    secret: 'test-secret',
    siteKey: 'test-site',
  });
  restoreFetch();
  assert.equal(ok, true);
});

// ---------------- Turnstile: misconfiguration & unconfigured ----------------
test('MISCONFIG fail closed: site key set but secret missing → REJECT (no bypass)', async () => {
  noFetch();
  const ok = await passesTurnstile({ token: undefined, secret: undefined, siteKey: 'test-site' });
  restoreFetch();
  assert.equal(ok, false);
});

test('not configured (neither key) → allow, so honeypot/validation/rate-limit still gate', async () => {
  noFetch();
  const ok = await passesTurnstile({ token: undefined, secret: undefined, siteKey: undefined });
  restoreFetch();
  assert.equal(ok, true);
});
