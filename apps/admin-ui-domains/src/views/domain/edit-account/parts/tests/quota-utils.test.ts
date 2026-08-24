/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  computedLimitToLimit,
  quotaExceedsDomainLimit,
  quotaValueFromLimit,
} from '../quota-utils';

const GB = 1024 ** 3;

describe('computedLimitToLimit', () => {
  it('should convert a limited value', () => {
    expect(computedLimitToLimit({ type: 'limited', value: 5 * GB })).toBe(5 * GB);
  });

  it('should pass unlimited through', () => {
    expect(computedLimitToLimit({ type: 'unlimited' })).toBe('unlimited');
  });

  it('should map undefined to undefined', () => {
    expect(computedLimitToLimit(undefined)).toBeUndefined();
  });
});

describe('quotaValueFromLimit', () => {
  it('should convert positive byte limits to GB', () => {
    expect(quotaValueFromLimit(5 * GB)).toBe(5);
  });

  it('should map zero to undefined', () => {
    expect(quotaValueFromLimit(0)).toBeUndefined();
  });

  it('should pass unlimited and undefined through', () => {
    expect(quotaValueFromLimit('unlimited')).toBe('unlimited');
    expect(quotaValueFromLimit(undefined)).toBeUndefined();
  });
});

describe('quotaExceedsDomainLimit', () => {
  it('should be true when the GB value exceeds the domain constraint', () => {
    expect(quotaExceedsDomainLimit(11, 10 * GB)).toBe(true);
  });

  it('should be false when the GB value is within the domain constraint', () => {
    expect(quotaExceedsDomainLimit(10, 10 * GB)).toBe(false);
    expect(quotaExceedsDomainLimit(9, 10 * GB)).toBe(false);
  });

  it('should be false without a numeric constraint or value', () => {
    expect(quotaExceedsDomainLimit(11, 'not-set')).toBe(false);
    expect(quotaExceedsDomainLimit(undefined, 10 * GB)).toBe(false);
    expect(quotaExceedsDomainLimit('unlimited', 10 * GB)).toBe(false);
  });
});
