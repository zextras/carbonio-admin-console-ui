/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { getInlineStyles, resolveThemeColor } from '../theme-utils';

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
      expect(result).toBe('var(--color-primary-regular, var(--color-primary))');
    });

    it('should return regular CSS variable when state is empty string', () => {
      const result = resolveThemeColor('primary', '');
      expect(result).toBe('var(--color-primary-regular, var(--color-primary))');
    });

    it('should return regular CSS variable when state is whitespace-only', () => {
      const result = resolveThemeColor('primary', '   ');
      expect(result).toBe('var(--color-primary-regular, var(--color-primary))');
    });

    it('should handle token names with hyphens', () => {
      const result = resolveThemeColor('my-color', '');
      expect(result).toBe('var(--color-my-color-regular, var(--color-my-color))');
    });

    it('should handle token names with numbers', () => {
      const result = resolveThemeColor('color1', '');
      expect(result).toBe('var(--color-color1-regular, var(--color-color1))');
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

function createElementWithStyle(styleText: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', styleText);
  return el;
}

describe('getInlineStyles', () => {
  describe('empty styles', () => {
    it('should return empty object when no inline styles are set', () => {
      const el = document.createElement('div');
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });

    it('should return empty object for empty style attribute', () => {
      const el = createElementWithStyle('');
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });

    it('should return empty object for whitespace-only style attribute', () => {
      const el = createElementWithStyle('   ');
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });
  });

  describe('single property', () => {
    it('should extract a single CSS property', () => {
      const el = createElementWithStyle('color: red');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'red' });
    });

    it('should extract a property with kebab-case name', () => {
      const el = createElementWithStyle('white-space: break-spaces');
      const result = getInlineStyles(el);
      expect(result).toEqual({ 'white-space': 'break-spaces' });
    });

    it('should extract a property with a CSS function value', () => {
      const el = createElementWithStyle('color: var(--color-primary)');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'var(--color-primary)' });
    });
  });

  describe('multiple properties', () => {
    it('should extract multiple inherited CSS properties', () => {
      const el = createElementWithStyle('color: red; font-size: 16px');
      const result = getInlineStyles(el);
      expect(result).toEqual({
        color: 'red',
        'font-size': '16px',
      });
    });

    it('should exclude non-inherited properties while keeping inherited ones', () => {
      const el = createElementWithStyle('color: red; font-size: 16px; margin: 0');
      const result = getInlineStyles(el);
      expect(result).toEqual({
        color: 'red',
        'font-size': '16px',
      });
    });
  });

  describe('CSS custom properties', () => {
    it('should extract CSS custom properties', () => {
      const el = createElementWithStyle('--ds-text-color: var(--color-error)');
      const result = getInlineStyles(el);
      expect(result).toEqual({ '--ds-text-color': 'var(--color-error)' });
    });

    it('should extract CSS custom property with a simple value', () => {
      const el = createElementWithStyle('--my-spacing: 1rem');
      const result = getInlineStyles(el);
      expect(result).toEqual({ '--my-spacing': '1rem' });
    });

    it('should extract mixed custom and standard properties', () => {
      const el = createElementWithStyle('--ds-text-color: red; white-space: nowrap');
      const result = getInlineStyles(el);
      expect(result).toEqual({
        '--ds-text-color': 'red',
        'white-space': 'nowrap',
      });
    });
  });

  describe('complex values', () => {
    it('should handle values with spaces', () => {
      const el = createElementWithStyle('text-decoration: underline dotted red');
      const result = getInlineStyles(el);
      expect(result).toEqual({ 'text-decoration': 'underline dotted red' });
    });

    it('should handle rgb() values', () => {
      const el = createElementWithStyle('color: rgb(0, 0, 0)');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'rgb(0, 0, 0)' });
    });

    it('should handle rgba() values', () => {
      const el = createElementWithStyle('color: rgba(0, 0, 0, 0.5)');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'rgba(0, 0, 0, 0.5)' });
    });

    it('should handle var() with fallback values', () => {
      const el = createElementWithStyle('color: var(--my-color, red)');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'var(--my-color, red)' });
    });

    it('should handle nested var() values', () => {
      const el = createElementWithStyle('color: var(--a, var(--b, blue))');
      const result = getInlineStyles(el);
      expect(result).toEqual({ color: 'var(--a, var(--b, blue))' });
    });
  });

  describe('programmatic style setting', () => {
    it('should read properties set via style.property', () => {
      const el = document.createElement('div');
      el.style.whiteSpace = 'break-spaces';
      const result = getInlineStyles(el);
      expect(result).toEqual({ 'white-space': 'break-spaces' });
    });

    it('should read properties set via setProperty', () => {
      const el = document.createElement('div');
      el.style.setProperty('--custom-prop', '42px');
      const result = getInlineStyles(el);
      expect(result).toEqual({ '--custom-prop': '42px' });
    });

    it('should read both attribute-set and programmatically-set properties', () => {
      const el = createElementWithStyle('color: red');
      el.style.setProperty('--extra', 'value');
      const result = getInlineStyles(el);
      expect(result).toEqual({
        color: 'red',
        '--extra': 'value',
      });
    });
  });

  describe('edge cases', () => {
    it('should not include properties with empty values', () => {
      const el = document.createElement('div');
      el.style.color = '';
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });

    it('should exclude non-inherited box-model properties', () => {
      const el = createElementWithStyle('padding: 10px 20px 30px 40px');
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });

    it('should exclude non-inherited layout properties', () => {
      const el = createElementWithStyle('width: calc(100% - 20px)');
      const result = getInlineStyles(el);
      expect(result).toEqual({});
    });

    it('should return a new object each time (not cached)', () => {
      const el = createElementWithStyle('color: red');
      const result1 = getInlineStyles(el);
      const result2 = getInlineStyles(el);
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
    });

    it('should reflect runtime style changes', () => {
      const el = createElementWithStyle('color: red');
      expect(getInlineStyles(el)).toEqual({ color: 'red' });
      el.style.color = 'blue';
      expect(getInlineStyles(el)).toEqual({ color: 'blue' });
    });

    it('should reflect removed properties', () => {
      const el = createElementWithStyle('color: red; white-space: nowrap');
      expect(Object.keys(getInlineStyles(el))).toHaveLength(2);
      el.style.removeProperty('color');
      expect(getInlineStyles(el)).toEqual({ 'white-space': 'nowrap' });
    });

    it('should only forward inherited properties when mixed with non-inherited', () => {
      const el = createElementWithStyle(
        'color: red; padding-left: 0.25rem; margin-top: 0.5rem; white-space: pre-line',
      );
      const result = getInlineStyles(el);
      expect(result).toEqual({
        color: 'red',
        'white-space': 'pre-line',
      });
    });
  });
});
