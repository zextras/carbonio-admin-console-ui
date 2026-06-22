/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { TOO_MANY_SEARCH_RESULTS_ERROR } from '../../../constants';
import { generateSnackbarFromError } from '../generate-snackbar-error';

const t = ((key: string, fallback: string): string => fallback) as TFunction;

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
    const error = new Error('Something specific went wrong');
    const result = generateSnackbarFromError(error, t);

    expect(result.label).toBe('Something specific went wrong');
  });

  it('should return fallback message when error has no message', () => {
    const error = new Error();
    const result = generateSnackbarFromError(error, t);

    expect(result.label).toBe('Something went wrong. Please try again.');
  });

  it('should return fallback message for error with empty message', () => {
    const error = new Error('');
    const result = generateSnackbarFromError(error, t);

    expect(result.label).toBe('Something went wrong. Please try again.');
  });

  it('should always return correct snackbar structure', () => {
    const error = new Error('test');
    const result = generateSnackbarFromError(error, t);

    expect(result).toHaveProperty('key', 'error');
    expect(result).toHaveProperty('severity', 'error');
    expect(result).toHaveProperty('autoHideTimeout', 3000);
    expect(result).toHaveProperty('hideButton', true);
    expect(result).toHaveProperty('replace', true);
  });
});
