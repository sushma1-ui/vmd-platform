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
    journeyStage: 'working',
    matter: 'gsm',
    firstName: 'A',
    email: 'a@example.com',
    mobile: '+61400000000',
  });
  assert.equal(r.timezone, 'Australia/Perth');
});
test('consultationRequest REQUIRES journeyStage and matter', () => {
  const base = { type: 'initial', firstName: 'A', email: 'a@example.com', mobile: '+61400000000' };
  // Missing both → rejected.
  assert.equal(consultationRequest.safeParse(base).success, false);
  // Missing matter only → rejected.
  assert.equal(consultationRequest.safeParse({ ...base, journeyStage: 'working' }).success, false);
  // Empty strings → rejected (a direct POST can't send blanks).
  assert.equal(
    consultationRequest.safeParse({ ...base, journeyStage: '', matter: '' }).success,
    false,
  );
  // Both present → accepted.
  assert.equal(
    consultationRequest.safeParse({ ...base, journeyStage: 'working', matter: 'gsm' }).success,
    true,
  );
});
test('status lifecycle includes no_show', () => {
  assert.ok(consultationStatus.options.includes('no_show'));
});
