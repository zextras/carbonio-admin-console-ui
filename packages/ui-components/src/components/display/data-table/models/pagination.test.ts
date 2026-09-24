/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { clampRange, isStalePage } from './pagination';

describe('clampRange', () => {
  it('computes the from/to window for a full middle page', () => {
    expect(clampRange(60, 2, 25)).toEqual({ from: 51, to: 60 });
  });

  it('clamps to the row count when the last page is partial', () => {
    expect(clampRange(10, 0, 25)).toEqual({ from: 1, to: 10 });
  });

  it('returns a zero window for an empty table', () => {
    expect(clampRange(0, 0, 25)).toEqual({ from: 0, to: 0 });
  });

  it('never yields from greater than to on a stale out-of-range page', () => {
    expect(clampRange(60, 5, 25)).toEqual({ from: 60, to: 60 });
  });
});

describe('isStalePage', () => {
  it('detects a page index beyond the last page', () => {
    expect(isStalePage(60, 5, 25)).toBe(true);
  });

  it('accepts a valid in-range page', () => {
    expect(isStalePage(60, 2, 25)).toBe(false);
  });

  it('treats an empty table as not stale', () => {
    expect(isStalePage(0, 0, 25)).toBe(false);
  });

  it('accepts the only-just-full first page', () => {
    expect(isStalePage(25, 0, 25)).toBe(false);
  });
});
