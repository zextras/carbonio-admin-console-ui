/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { resolveThemeColor } from '../theme-utils';

describe('getThemeColorVar', () => {
  describe('empty/falsy colorName', () => {
    it('should return empty string when colorName is empty', () => {
      const result = resolveThemeColor('', 'hover');
      expect(result).toBe('');
    });

    it('should return empty string when colorName is whitespace-only', () => {
      const result = resolveThemeColor('   ', 'hover');
      expect(result).toBe('');
    });
  });

  describe('non-token names (pass-through)', () => {
    it('should pass through hex colors', () => {
      const result = resolveThemeColor('#fff', 'hover');
      expect(result).toBe('#fff');
    });

    it('should pass through rgb values', () => {
      const result = resolveThemeColor('rgb(0, 0, 0)', 'hover');
      expect(result).toBe('rgb(0, 0, 0)');
    });

    it('should pass through existing CSS variables', () => {
      const result = resolveThemeColor('var(--custom)', 'hover');
      expect(result).toBe('var(--custom)');
    });

    it('should pass through values with spaces', () => {
      const result = resolveThemeColor('10px 5px', 'hover');
      expect(result).toBe('10px 5px');
    });

    it('should pass through values with special characters', () => {
      const result = resolveThemeColor('hsla(0, 0%, 0%, 1)', 'hover');
      expect(result).toBe('hsla(0, 0%, 0%, 1)');
    });
  });

  describe('token names without state', () => {
    it('should return regular CSS variable when state is undefined', () => {
      const result = resolveThemeColor('primary', undefined as unknown as string);
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should return regular CSS variable when state is empty string', () => {
      const result = resolveThemeColor('primary', '');
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should return regular CSS variable when state is whitespace-only', () => {
      const result = resolveThemeColor('primary', '   ');
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should handle token names with hyphens', () => {
      const result = resolveThemeColor('my-color', '');
      expect(result).toBe('var(--color-my-color-regular)');
    });

    it('should handle token names with numbers', () => {
      const result = resolveThemeColor('color1', '');
      expect(result).toBe('var(--color-color1-regular)');
    });
  });

  describe('token names with state', () => {
    it('should return CSS variable with fallback for hover state', () => {
      const result = resolveThemeColor('primary', 'hover');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should return CSS variable with fallback for disabled state', () => {
      const result = resolveThemeColor('secondary', 'disabled');
      expect(result).toBe('var(--color-secondary-disabled, var(--color-secondary-regular))');
    });

    it('should return CSS variable with fallback for focus state', () => {
      const result = resolveThemeColor('error', 'focus');
      expect(result).toBe('var(--color-error-focus, var(--color-error-regular))');
    });
  });

  describe('whitespace trimming', () => {
    it('should trim whitespace from colorName', () => {
      const result = resolveThemeColor('  primary  ', 'hover');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should trim whitespace from state', () => {
      const result = resolveThemeColor('primary', '  hover  ');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should trim whitespace from both colorName and state', () => {
      const result = resolveThemeColor('  primary  ', '  hover  ');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });
  });
});
