/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import type { BackupAccountItem } from '../../../types';
import { extractLegalHoldAccounts, parseBackupAccountsResponse } from '../parse-backup-accounts';

const account: BackupAccountItem = {
  id: 'acc-1',
  name: 'admin@test.com',
  status: 'active',
  legalHold: 'false',
  serverName: 'mailstore1.test.com',
  creationTimestamp: 1700000000000,
};

describe('parseBackupAccountsResponse', () => {
  it('should return flat accounts and maxPage when present', () => {
    expect(
      parseBackupAccountsResponse({
        accounts: [account],
        maxPage: 3,
      }),
    ).toEqual({ accounts: [account], maxPage: 3 });
  });

  it('should default maxPage to 0 when missing on a flat response', () => {
    expect(parseBackupAccountsResponse({ accounts: [account] })).toEqual({
      accounts: [account],
      maxPage: 0,
    });
  });

  it('should merge accounts from the multi-server response shape', () => {
    const secondAccount = { ...account, id: 'acc-2', serverName: 'mailstore2.test.com' };
    expect(
      parseBackupAccountsResponse({
        mailstore1: { response: { accounts: [account], maxPage: 1 } },
        mailstore2: { response: { accounts: [secondAccount], maxPage: 4 } },
      }),
    ).toEqual({ accounts: [account, secondAccount], maxPage: 4 });
  });

  it('should return an empty list when no accounts are present', () => {
    expect(parseBackupAccountsResponse({})).toEqual({ accounts: [], maxPage: 0 });
  });
});

describe('extractLegalHoldAccounts', () => {
  it('should return accounts from the flat response', () => {
    expect(extractLegalHoldAccounts({ accounts: [account] })).toEqual([account]);
  });

  it('should merge accounts from the multi-server response shape', () => {
    expect(
      extractLegalHoldAccounts({
        mailstore1: { response: { accounts: [account] } },
      }),
    ).toEqual([account]);
  });

  it('should return an empty list when no accounts are present', () => {
    expect(extractLegalHoldAccounts({})).toEqual([]);
  });
});
