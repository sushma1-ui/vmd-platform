import { test } from 'node:test';
import assert from 'node:assert/strict';
import { healthCheckSubmission } from './health-check.ts';

const base = {
  situation: 'skilled-professional',
  location: 'offshore',
  country: 'India',
  nationality: 'Indian',
  everRefusedOrCancelled: 'no',
  firstName: 'Asha',
  email: 'asha@example.com',
} as const;

test('healthCheckSubmission accepts a complete lead-capture submission', () => {
  assert.equal(healthCheckSubmission.safeParse(base).success, true);
});

test('healthCheckSubmission requires country and nationality', () => {
  const { country: _c, nationality: _n, ...without } = base;
  assert.equal(healthCheckSubmission.safeParse(without).success, false);
});

test('healthCheckSubmission carries client attribution (UTM + referrer)', () => {
  const r = healthCheckSubmission.safeParse({
    ...base,
    attribution: { utmSource: 'google', utmMedium: 'cpc', referrer: 'https://g.co' },
  });
  assert.equal(r.success, true);
  assert.equal(r.data?.attribution?.utmSource, 'google');
});

test('healthCheckSubmission is capture-only: no eligibility/result/score field', () => {
  const parsed = healthCheckSubmission.parse(base);
  assert.equal('result' in parsed, false);
  assert.equal('eligibility' in parsed, false);
  assert.equal('score' in parsed, false);
});
