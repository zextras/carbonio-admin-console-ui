/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { sanitizeNumberValue } from '../number-input';

describe('sanitizeNumberValue', () => {
  it.each([
    ['', ''],
    ['0', '0'],
    ['7', '7'],
    ['10', '10'],
    ['007', '7'],
    ['000', '0'],
    ['0123', '123'],
    ['1e5', '15'],
    ['1.5', '15'],
    ['-3', '3'],
    ['+42', '42'],
    ['12abc34', '1234'],
    ['abc', ''],
    ['0.5', '5'],
  ])('sanitizes %j to %j', (input, expected) => {
    expect(sanitizeNumberValue(input)).toBe(expected);
  });
});
