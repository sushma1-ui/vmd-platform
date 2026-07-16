import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSchedulingProvider } from './index.ts';

test('manual provider is idempotent by bookingKey', async () => {
  const p = getSchedulingProvider('manual');
  const input = { bookingKey: 'c1', slot: { startUtc: 'x', endUtc: 'y' }, attendee: { firstName: 'A', email: 'a@b.c' }, timezone: 'Australia/Perth' };
  assert.equal(await p.createAppointment(input), await p.createAppointment(input));
});
test('unwired provider throws a clear error', () => {
  assert.throws(() => getSchedulingProvider('calcom'), /not wired yet/);
});
