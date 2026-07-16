import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, round2 } from './contrast.ts';
import { palette } from './color.ts';

test('navy on white clears AAA', () => {
  assert.ok(round2(contrastRatio(palette.navy, palette.white)) >= 7);
});
test('gold on white FAILS text contrast (must never carry text)', () => {
  assert.ok(round2(contrastRatio(palette.gold, palette.white)) < 4.5);
});
test('gold on navy clears AA', () => {
  assert.ok(round2(contrastRatio(palette.gold, palette.navy)) >= 4.5);
});
