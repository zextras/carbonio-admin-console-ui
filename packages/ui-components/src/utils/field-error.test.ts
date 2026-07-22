/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getFieldErrorProps } from './field-error';

type MockFieldOverrides = {
  isValid?: boolean;
  isBlurred?: boolean;
  errors?: Array<unknown>;
};

function createMockField(overrides: MockFieldOverrides = {}) {
  return {
    state: {
      meta: {
        isValid: overrides.isValid ?? true,
        isBlurred: overrides.isBlurred ?? false,
        errors: overrides.errors ?? [],
      },
    },
  } as any;
}

function mockT(key: string, fallback?: string): string {
  return fallback ?? key;
}

describe('getFieldErrorProps', () => {
  it('returns { hasError: false } when the field is valid', () => {
    const field = createMockField({ isValid: true });
    const result = getFieldErrorProps(field, false, mockT as any);
    expect(result).toEqual({ hasError: false });
  });

  it('returns { hasError: false } when the field is invalid but not blurred and not submitted', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: false,
      errors: ['error.required'],
    });
    const result = getFieldErrorProps(field, false, mockT as any);
    expect(result).toEqual({ hasError: false });
  });

  it('returns { hasError: true, description } when the field is invalid and blurred', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: ['error.required'],
    });
    const result = getFieldErrorProps(field, false, mockT as any);
    expect(result.hasError).toBe(true);
    expect(result.description).toBe('error.required');
  });

  it('returns { hasError: true, description } when the field is invalid and isSubmitted is true', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: false,
      errors: ['error.required'],
    });
    const result = getFieldErrorProps(field, true, mockT as any);
    expect(result.hasError).toBe(true);
    expect(result.description).toBe('error.required');
  });

  it('handles error as a string and uses it as i18n key', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: ['error.min_length'],
    });
    const result = getFieldErrorProps(field, false, mockT as any);
    expect(result.description).toBe('error.min_length');
  });

  it('handles error as an object with a .message property', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: [{ message: 'error.custom' }],
    });
    const result = getFieldErrorProps(field, false, mockT as any);
    expect(result.description).toBe('error.custom');
  });

  it('uses errorMessages override map when provided', () => {
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: ['error.required'],
    });
    const errorMessages: Record<string, string> = {
      'error.required': 'This field is required',
    };
    const result = getFieldErrorProps(field, false, mockT as any, errorMessages);
    expect(result.description).toBe('This field is required');
  });

  it('passes the error key and fallback from errorMessages to t()', () => {
    const t = vi.fn((key: string, fallback?: string) => fallback ?? key);
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: ['error.required'],
    });
    const errorMessages: Record<string, string> = {
      'error.required': 'This field is required',
    };
    getFieldErrorProps(field, false, t as any, errorMessages);
    expect(t).toHaveBeenCalledWith('error.required', 'This field is required');
  });

  it('passes the error key itself as fallback to t() when no errorMessages is provided', () => {
    const t = vi.fn((key: string, fallback?: string) => fallback ?? key);
    const field = createMockField({
      isValid: false,
      isBlurred: true,
      errors: ['error.required'],
    });
    getFieldErrorProps(field, false, t as any);
    expect(t).toHaveBeenCalledWith('error.required', 'error.required');
  });
});
