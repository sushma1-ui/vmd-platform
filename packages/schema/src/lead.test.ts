import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema, scoreLead } from './lead.ts';

test('leadSchema stores identity fields for the migration team', () => {
  const r = leadSchema.safeParse({
    source: 'health-check',
    submissionId: 'VHC-20260719-A1B2C3',
    firstName: 'Asha',
    email: 'asha@example.com',
    country: 'India',
    nationality: 'Indian',
    currentVisa: 'Subclass 500',
    attribution: { utmSource: 'google' },
  });
  assert.equal(r.success, true);
  assert.equal(r.data?.country, 'India');
  assert.equal(r.data?.submissionId, 'VHC-20260719-A1B2C3');
});

test('scoreLead is deterministic by source (web + cms agree)', () => {
  assert.equal(scoreLead('health-check'), 60);
  assert.equal(scoreLead('second-opinion'), 100);
});
