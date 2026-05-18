/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, test } from 'vitest';

import { isValidDecimalInput } from '../validators';

describe('isValidDecimalInput', () => {
  describe('valid inputs', () => {
    test('should accept integer strings', () => {
      expect(isValidDecimalInput('0')).toBe(true);
      expect(isValidDecimalInput('1')).toBe(true);
      expect(isValidDecimalInput('123')).toBe(true);
      expect(isValidDecimalInput('999999')).toBe(true);
    });

    test('should accept decimal strings', () => {
      expect(isValidDecimalInput('1.5')).toBe(true);
      expect(isValidDecimalInput('0.5')).toBe(true);
      expect(isValidDecimalInput('123.456')).toBe(true);
      expect(isValidDecimalInput('0.0')).toBe(true);
    });

    test('should accept leading dot (partial input during typing)', () => {
      expect(isValidDecimalInput('.5')).toBe(true);
      expect(isValidDecimalInput('.0')).toBe(true);
      expect(isValidDecimalInput('.123')).toBe(true);
    });

    test('should accept trailing dot (partial input during typing)', () => {
      expect(isValidDecimalInput('1.')).toBe(true);
      expect(isValidDecimalInput('123.')).toBe(true);
    });

    test('should accept empty string (cleared input)', () => {
      expect(isValidDecimalInput('')).toBe(true);
    });

    test('should accept lone dot (typing a decimal)', () => {
      expect(isValidDecimalInput('.')).toBe(true);
    });

    test('should accept zero-prefixed numbers', () => {
      expect(isValidDecimalInput('00')).toBe(true);
      expect(isValidDecimalInput('01.5')).toBe(true);
      expect(isValidDecimalInput('00123')).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    test('should reject strings with letters', () => {
      expect(isValidDecimalInput('abc')).toBe(false);
      expect(isValidDecimalInput('1a')).toBe(false);
      expect(isValidDecimalInput('a1')).toBe(false);
    });

    test('should reject multiple decimal points', () => {
      expect(isValidDecimalInput('1.2.3')).toBe(false);
      expect(isValidDecimalInput('..5')).toBe(false);
      expect(isValidDecimalInput('1..')).toBe(false);
    });

    test('should reject scientific notation', () => {
      expect(isValidDecimalInput('1e5')).toBe(false);
      expect(isValidDecimalInput('1E10')).toBe(false);
    });

    test('should reject special characters', () => {
      expect(isValidDecimalInput('1+2')).toBe(false);
      expect(isValidDecimalInput('1-2')).toBe(false);
      expect(isValidDecimalInput('1,5')).toBe(false);
    });

    test('should reject whitespace', () => {
      expect(isValidDecimalInput(' ')).toBe(false);
      expect(isValidDecimalInput(' 1')).toBe(false);
      expect(isValidDecimalInput('1 ')).toBe(false);
      expect(isValidDecimalInput('1 2')).toBe(false);
    });

    test('should reject negative sign', () => {
      expect(isValidDecimalInput('-1')).toBe(false);
      expect(isValidDecimalInput('-1.5')).toBe(false);
    });
  });
});
