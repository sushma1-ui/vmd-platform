import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreLead } from './lead.ts';
import { leadSchema } from './lead.ts';
import { indicativeReviewWindow } from './second-opinion.ts';

test('second-opinion is the highest-scoring lead source', () => {
  assert.equal(scoreLead('second-opinion'), 100);
  assert.ok(scoreLead('second-opinion') > scoreLead('newsletter'));
});
test('leadSchema rejects a bad email', () => {
  const r = leadSchema.safeParse({ source: 'quick-enquiry', firstName: 'A', email: 'not-an-email' });
  assert.equal(r.success, false);
});
test('indicative review window returns earliest before typical', () => {
  const w = indicativeReviewWindow('2026-07-01');
  assert.ok(w && w.earliest < w.typical);
});
