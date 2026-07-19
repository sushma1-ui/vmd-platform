import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatSubmissionReference, submissionReference } from './reference.ts';

test('formatSubmissionReference builds VMD-YYYYMMDD-NNNNNN, zero-padded', () => {
  const ref = formatSubmissionReference(new Date(Date.UTC(2026, 6, 19)), 123);
  assert.equal(ref, 'VMD-20260719-000123');
});

test('formatSubmissionReference wraps the sequence into 6 digits', () => {
  const ref = formatSubmissionReference(new Date(Date.UTC(2026, 0, 1)), 1_000_123);
  assert.equal(ref, 'VMD-20260101-000123');
});

test('submissionReference validator accepts the format and rejects others', () => {
  assert.equal(submissionReference.safeParse('VMD-20260719-000123').success, true);
  assert.equal(submissionReference.safeParse('VMD-2026-1').success, false);
  assert.equal(submissionReference.safeParse('ABC-20260719-000123').success, false);
});
