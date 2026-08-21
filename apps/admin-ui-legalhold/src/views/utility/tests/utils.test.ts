/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { formattedErrorMessage } from '../utils';

describe('formattedErrorMessage', () => {
  it('should replace placeholders with detail values', () => {
    const result = formattedErrorMessage({
      code: 'ERR',
      details: { account: 'admin@test.com', server: 'mail1' },
      message: 'Cannot restore {account} on {server}',
      time: 1,
    });

    expect(result.message).toBe('Cannot restore admin@test.com on mail1');
  });

  it('should return the response unchanged when details are missing', () => {
    const response = {
      code: 'ERR',
      details: undefined as unknown as Record<string, string>,
      message: 'Plain error',
      time: 1,
    };

    expect(formattedErrorMessage(response).message).toBe('Plain error');
  });
});
