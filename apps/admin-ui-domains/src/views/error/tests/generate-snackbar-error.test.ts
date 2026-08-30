/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { TOO_MANY_SEARCH_RESULTS_ERROR } from '../../../constants';
import { generateSnackbarFromError, resolveErrorLabel } from '../generate-snackbar-error';

const t = ((_key: string, fallback?: string) => fallback ?? _key) as TFunction;

describe('resolveErrorLabel', () => {
  it('should return the string as-is when the error is a string', () => {
    expect(resolveErrorLabel('plain string failure', t)).toBe('plain string failure');
  });

  it('should return the custom fallback when provided and the error has no message', () => {
    expect(resolveErrorLabel(new Error(), t, 'Custom fallback')).toBe('Custom fallback');
  });

  it('should return the default fallback when the error has no message', () => {
    expect(resolveErrorLabel(new Error(), t)).toBe('Something went wrong. Please try again.');
  });

  it('should return the default fallback when the error message is empty', () => {
    expect(resolveErrorLabel(new Error(''), t)).toBe('Something went wrong. Please try again.');
  });

  it('should map too-many-results errors to the refined search message', () => {
    expect(resolveErrorLabel(new Error(`prefix: ${TOO_MANY_SEARCH_RESULTS_ERROR}`), t)).toBe(
      'The number of results exceeded the limit. Please use search to refine the results.',
    );
  });

  it('should return the error message when present', () => {
    expect(resolveErrorLabel(new Error('Boom'), t)).toBe('Boom');
  });
});

describe('generateSnackbarFromError', () => {
  it('should return too many results message when error contains TOO_MANY_SEARCH_RESULTS_ERROR', () => {
    const error = new Error(`account.SOAP_FAULT_ERROR: ${TOO_MANY_SEARCH_RESULTS_ERROR}`);
    const result = generateSnackbarFromError(error, t);

    expect(result).toEqual({
      key: 'error',
      severity: 'error',
      label: 'The number of results exceeded the limit. Please use search to refine the results.',
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  });

  it('should return error message for generic errors', () => {
    const result = generateSnackbarFromError(new Error('Something specific went wrong'), t);

    expect(result.label).toBe('Something specific went wrong');
  });

  it('should return fallback message when error has no message', () => {
    const result = generateSnackbarFromError(new Error(), t);

    expect(result.label).toBe('Something went wrong. Please try again.');
  });

  it('should return fallback message for error with empty message', () => {
    const result = generateSnackbarFromError(new Error(''), t);

    expect(result.label).toBe('Something went wrong. Please try again.');
  });

  it('should always return correct snackbar structure', () => {
    const result = generateSnackbarFromError(new Error('test'), t);

    expect(result).toHaveProperty('key', 'error');
    expect(result).toHaveProperty('severity', 'error');
    expect(result).toHaveProperty('autoHideTimeout', 3000);
    expect(result).toHaveProperty('hideButton', true);
    expect(result).toHaveProperty('replace', true);
  });
});
