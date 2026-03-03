/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { getThemeColorVar } from '../theme-utils';

describe('getThemeColorVar', () => {
  describe('empty/falsy colorName', () => {
    it('should return empty string when colorName is empty', () => {
      const result = getThemeColorVar('', 'hover');
      expect(result).toBe('');
    });

    it('should return empty string when colorName is whitespace-only', () => {
      const result = getThemeColorVar('   ', 'hover');
      expect(result).toBe('');
    });
  });

  describe('non-token names (pass-through)', () => {
    it('should pass through hex colors', () => {
      const result = getThemeColorVar('#fff', 'hover');
      expect(result).toBe('#fff');
    });

    it('should pass through rgb values', () => {
      const result = getThemeColorVar('rgb(0, 0, 0)', 'hover');
      expect(result).toBe('rgb(0, 0, 0)');
    });

    it('should pass through existing CSS variables', () => {
      const result = getThemeColorVar('var(--custom)', 'hover');
      expect(result).toBe('var(--custom)');
    });

    it('should pass through values with spaces', () => {
      const result = getThemeColorVar('10px 5px', 'hover');
      expect(result).toBe('10px 5px');
    });

    it('should pass through values with special characters', () => {
      const result = getThemeColorVar('hsla(0, 0%, 0%, 1)', 'hover');
      expect(result).toBe('hsla(0, 0%, 0%, 1)');
    });
  });

  describe('token names without state', () => {
    it('should return regular CSS variable when state is undefined', () => {
      const result = getThemeColorVar('primary', undefined as unknown as string);
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should return regular CSS variable when state is empty string', () => {
      const result = getThemeColorVar('primary', '');
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should return regular CSS variable when state is whitespace-only', () => {
      const result = getThemeColorVar('primary', '   ');
      expect(result).toBe('var(--color-primary-regular)');
    });

    it('should handle token names with hyphens', () => {
      const result = getThemeColorVar('my-color', '');
      expect(result).toBe('var(--color-my-color-regular)');
    });

    it('should handle token names with numbers', () => {
      const result = getThemeColorVar('color1', '');
      expect(result).toBe('var(--color-color1-regular)');
    });
  });

  describe('token names with state', () => {
    it('should return CSS variable with fallback for hover state', () => {
      const result = getThemeColorVar('primary', 'hover');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should return CSS variable with fallback for disabled state', () => {
      const result = getThemeColorVar('secondary', 'disabled');
      expect(result).toBe('var(--color-secondary-disabled, var(--color-secondary-regular))');
    });

    it('should return CSS variable with fallback for focus state', () => {
      const result = getThemeColorVar('error', 'focus');
      expect(result).toBe('var(--color-error-focus, var(--color-error-regular))');
    });
  });

  describe('whitespace trimming', () => {
    it('should trim whitespace from colorName', () => {
      const result = getThemeColorVar('  primary  ', 'hover');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should trim whitespace from state', () => {
      const result = getThemeColorVar('primary', '  hover  ');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });

    it('should trim whitespace from both colorName and state', () => {
      const result = getThemeColorVar('  primary  ', '  hover  ');
      expect(result).toBe('var(--color-primary-hover, var(--color-primary-regular))');
    });
  });

  describe('CSS keywords (pass-through)', () => {
    it('should pass through currentColor', () => {
      const result = getThemeColorVar('currentColor', 'hover');
      expect(result).toBe('currentColor');
    });

    it('should pass through transparent', () => {
      const result = getThemeColorVar('transparent', 'hover');
      expect(result).toBe('transparent');
    });

    it('should pass through inherit', () => {
      const result = getThemeColorVar('inherit', 'hover');
      expect(result).toBe('inherit');
    });

    it('should pass through initial', () => {
      const result = getThemeColorVar('initial', 'hover');
      expect(result).toBe('initial');
    });

    it('should pass through unset', () => {
      const result = getThemeColorVar('unset', 'hover');
      expect(result).toBe('unset');
    });

    it('should pass through CSS keywords with whitespace', () => {
      const result = getThemeColorVar('  transparent  ', 'hover');
      expect(result).toBe('transparent');
    });

    it('should pass through CSS keywords without state', () => {
      const result = getThemeColorVar('currentColor', '');
      expect(result).toBe('currentColor');
    });
  });
});
