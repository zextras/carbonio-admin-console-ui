/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, test } from 'vitest';

import { isValidDecimalNumber } from '../validators';

describe('isValidDecimalNumber', () => {
  describe('valid inputs', () => {
    test('should accept integer strings', () => {
      expect(isValidDecimalNumber('0')).toBe(true);
      expect(isValidDecimalNumber('1')).toBe(true);
      expect(isValidDecimalNumber('123')).toBe(true);
      expect(isValidDecimalNumber('999999')).toBe(true);
    });

    test('should accept decimal strings', () => {
      expect(isValidDecimalNumber('1.5')).toBe(true);
      expect(isValidDecimalNumber('0.5')).toBe(true);
      expect(isValidDecimalNumber('123.456')).toBe(true);
      expect(isValidDecimalNumber('0.0')).toBe(true);
    });

    test('should accept leading dot (partial input during typing)', () => {
      expect(isValidDecimalNumber('.5')).toBe(true);
      expect(isValidDecimalNumber('.0')).toBe(true);
      expect(isValidDecimalNumber('.123')).toBe(true);
    });

    test('should accept trailing dot (partial input during typing)', () => {
      expect(isValidDecimalNumber('1.')).toBe(true);
      expect(isValidDecimalNumber('123.')).toBe(true);
    });

    test('should accept empty string (cleared input)', () => {
      expect(isValidDecimalNumber('')).toBe(true);
    });

    test('should accept lone dot (typing a decimal)', () => {
      expect(isValidDecimalNumber('.')).toBe(true);
    });

    test('should accept zero-prefixed numbers', () => {
      expect(isValidDecimalNumber('00')).toBe(true);
      expect(isValidDecimalNumber('01.5')).toBe(true);
      expect(isValidDecimalNumber('00123')).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    test('should reject strings with letters', () => {
      expect(isValidDecimalNumber('abc')).toBe(false);
      expect(isValidDecimalNumber('1a')).toBe(false);
      expect(isValidDecimalNumber('a1')).toBe(false);
    });

    test('should reject multiple decimal points', () => {
      expect(isValidDecimalNumber('1.2.3')).toBe(false);
      expect(isValidDecimalNumber('..5')).toBe(false);
      expect(isValidDecimalNumber('1..')).toBe(false);
    });

    test('should reject scientific notation', () => {
      expect(isValidDecimalNumber('1e5')).toBe(false);
      expect(isValidDecimalNumber('1E10')).toBe(false);
    });

    test('should reject special characters', () => {
      expect(isValidDecimalNumber('1+2')).toBe(false);
      expect(isValidDecimalNumber('1-2')).toBe(false);
      expect(isValidDecimalNumber('1,5')).toBe(false);
    });

    test('should reject whitespace', () => {
      expect(isValidDecimalNumber(' ')).toBe(false);
      expect(isValidDecimalNumber(' 1')).toBe(false);
      expect(isValidDecimalNumber('1 ')).toBe(false);
      expect(isValidDecimalNumber('1 2')).toBe(false);
    });

    test('should reject negative sign', () => {
      expect(isValidDecimalNumber('-1')).toBe(false);
      expect(isValidDecimalNumber('-1.5')).toBe(false);
    });
  });
});
