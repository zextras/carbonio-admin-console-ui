/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import { generateSnackbarFromError } from '../generate-snackbar-error';

const t = ((_key: string, fallback?: string) => fallback ?? _key) as TFunction;

describe('generateSnackbarFromError', () => {
  it('should map too-many-results errors to the refined search message', () => {
    const result = generateSnackbarFromError(new Error('too many search results returned'), t);

    expect(result.label).toBe(
      'The number of results exceeded the limit. Please use search to refine the results.',
    );
    expect(result.severity).toBe('error');
  });

  it('should use the error message when present', () => {
    expect(generateSnackbarFromError(new Error('Boom'), t).label).toBe('Boom');
  });

  it('should use the fallback message when the error has no message', () => {
    expect(generateSnackbarFromError(new Error(), t).label).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
