import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consultationRequest, consultationStatus } from './booking.ts';

test('consultationRequest requires a mobile', () => {
  const r = consultationRequest.safeParse({
    type: 'online',
    firstName: 'A',
    email: 'a@example.com',
  });
  assert.equal(r.success, false);
});
test('consultationRequest defaults timezone to Perth', () => {
  const r = consultationRequest.parse({
    type: 'online',
    firstName: 'A',
    email: 'a@example.com',
    mobile: '+61400000000',
  });
  assert.equal(r.timezone, 'Australia/Perth');
});
test('status lifecycle includes no_show', () => {
  assert.ok(consultationStatus.options.includes('no_show'));
});
