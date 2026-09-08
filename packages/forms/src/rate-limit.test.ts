import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from './rate-limit.ts';

// No Upstash config → the in-memory fallback is exercised (the production floor when
// Upstash is unset). Each key uses a unique suffix so tests don't interfere.

test('rate limit allows up to the limit, then blocks', async () => {
  const key = `test:allow:${Math.random()}`;
  const seen: boolean[] = [];
  for (let i = 0; i < 6; i++) seen.push(await rateLimit(key, 5, 60, {}));
  assert.deepEqual(seen, [true, true, true, true, true, false]);
});

test('rate limit is per-key: exhausting one key does not affect another', async () => {
  const a = `test:a:${Math.random()}`;
  const b = `test:b:${Math.random()}`;
  for (let i = 0; i < 5; i++) await rateLimit(a, 5, 60, {});
  assert.equal(await rateLimit(a, 5, 60, {}), false); // a exhausted
  assert.equal(await rateLimit(b, 5, 60, {}), true); // b independent
});

test('a fresh window starts allowing again after it expires', async () => {
  const key = `test:window:${Math.random()}`;
  // windowSec 0 → the bucket is already expired on the next call, so it resets.
  assert.equal(await rateLimit(key, 1, 0, {}), true);
  assert.equal(await rateLimit(key, 1, 0, {}), true); // previous window expired → new bucket
});
