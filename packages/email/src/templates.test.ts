import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from './templates.ts';

test('client confirmation thanks, promises 1–2 business days, and gives no advice', () => {
  const { subject, text } = renderTemplate('health-check-received', {
    firstName: 'Asha',
    submissionId: 'VHC-1',
  });
  assert.match(subject, /Free Visa Health Check/);
  assert.match(text, /Asha/);
  assert.match(text, /1–2 business days/);
  assert.match(text, /no migration advice has been provided yet/i);
  assert.match(text, /VHC-1/);
});

test('client confirmation never states an eligibility result', () => {
  const { text } = renderTemplate('health-check-received', { firstName: 'Asha' });
  assert.doesNotMatch(text, /eligib|indicative result|your result|likely relevant/i);
});

test('admin notification carries id, source, identity and questionnaire answers', () => {
  const { subject, text } = renderTemplate('lead-internal-notification', {
    submissionId: 'VHC-2',
    source: 'health-check',
    score: 60,
    firstName: 'Asha',
    email: 'asha@example.com',
    country: 'India',
    nationality: 'Indian',
    currentVisa: 'Subclass 500',
    healthCheck: { englishTest: 'yes', skillsAssessment: 'no' },
    attribution: { utmSource: 'google' },
  });
  assert.match(subject, /VHC-2/);
  assert.match(text, /health-check/);
  assert.match(text, /asha@example.com/);
  assert.match(text, /India/);
  assert.match(text, /Indian/);
  assert.match(text, /englishTest: yes/);
  assert.match(text, /utmSource: google/);
});

test('Study (educational) enquiry is labelled "Study Enquiry" in subject and body heading', () => {
  const { subject, text } = renderTemplate('lead-internal-notification', {
    source: 'educational consultation booking',
    firstName: 'Bikash',
    email: 'bikash@example.com',
  });
  assert.match(subject, /^New Study Enquiry — Bikash/);
  assert.match(text, /^Study Enquiry\n/); // explicit body heading
});

test('General enquiry and normal booking labels are unchanged (no Study leak)', () => {
  const general = renderTemplate('lead-internal-notification', {
    source: 'general-enquiry',
    firstName: 'Gen',
    email: 'g@example.com',
  });
  assert.match(general.subject, /^New website enquiry — Gen/);
  assert.doesNotMatch(general.text, /Study Enquiry/);

  const booking = renderTemplate('lead-internal-notification', {
    source: 'consultation booking',
    firstName: 'Bo',
    email: 'b@example.com',
  });
  assert.match(booking.subject, /^New consultation booking — Bo/);
  assert.doesNotMatch(booking.text, /Study Enquiry/);
});
