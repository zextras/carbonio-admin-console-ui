/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { legalHoldQueryKeys } from '../legal-hold-query-keys';

describe('legalHoldQueryKeys', () => {
  it('should nest all keys under the legal-hold root', () => {
    expect(legalHoldQueryKeys.all).toEqual(['legal-hold']);
    expect(legalHoldQueryKeys.backupAccounts('test.com', '', false, 0, 10)[0]).toBe('legal-hold');
    expect(legalHoldQueryKeys.domains('test.com')).toEqual(['legal-hold', 'domains', 'test.com']);
    expect(legalHoldQueryKeys.accountDirectory('admin', 'acc-1')).toEqual([
      'legal-hold',
      'account-directory',
      'admin',
      'acc-1',
    ]);
    expect(legalHoldQueryKeys.account('admin@test.com')).toEqual([
      'legal-hold',
      'account',
      'admin@test.com',
    ]);
  });
});
