import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from './index.ts';

// Server-side validation: the endpoints reject anything the Zod schema rejects,
// regardless of what the client sent (direct POSTs are validated identically).

test('invalid payload is REJECTED (bad source, empty name, bad email)', () => {
  const r = validateLead({ source: 'not-a-source', firstName: '', email: 'nope' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(Object.keys(r.fieldErrors).length > 0);
});

test('missing required fields are REJECTED', () => {
  const r = validateLead({});
  assert.equal(r.ok, false);
});

test('a well-formed payload is accepted', () => {
  const r = validateLead({
    source: 'general-enquiry',
    firstName: 'Asha',
    email: 'asha@example.com',
  });
  assert.equal(r.ok, true);
});
