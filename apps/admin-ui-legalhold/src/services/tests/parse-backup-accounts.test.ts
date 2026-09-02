/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import type { BackupAccountItem } from '../../../types';
import { extractLegalHoldAccounts } from '../parse-backup-accounts';

const account: BackupAccountItem = {
  id: 'acc-1',
  name: 'admin@test.com',
  status: 'active',
  legalHold: 'false',
  serverName: 'mailstore1.test.com',
  creationTimestamp: 1700000000000,
};

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
