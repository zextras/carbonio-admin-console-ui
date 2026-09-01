/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  TOTAL_COMPUTED_QUOTA_LIMIT,
  TOTAL_QUOTA_SOURCE,
  TOTAL_QUOTA_STATUS,
  TOTAL_QUOTA_USED,
  TOTAL_QUOTA_USED_BY_MODULE,
} from '../../../constants';
import type { FlattenedAccount } from '../../../services/use-account-detail';
import {
  buildAccountFormValues,
  buildSyncedAccountFormValues,
} from '../account-form-provider';

const mockDetail = {
  name: 'test-user@test-domain.com',
  sn: 'User',
  givenName: 'Test',
  zimbraId: 'mock-zimbra-id',
} as FlattenedAccount;

const mockQuota = {
  type: 'success' as const,
  totalComputedLimit: { type: 'limited' as const, value: 10737418240 },
  totalLimitSource: 'account' as const,
  totalStatus: 'UNDERQUOTA' as const,
  totalUsed: 5368709120,
  usedByModules: {
    mailbox: 4000000000,
    files: 1000000000,
    wsc: 368709120,
  },
};

describe('buildAccountFormValues', () => {
  it('clears quota fields so a detail-only reset does not show stale quota', () => {
    const values = buildAccountFormValues(mockDetail);

    expect(values[TOTAL_COMPUTED_QUOTA_LIMIT]).toBeUndefined();
    expect(values[TOTAL_QUOTA_USED]).toBeUndefined();
    expect(values[TOTAL_QUOTA_USED_BY_MODULE]).toBeUndefined();
    expect(values[TOTAL_QUOTA_SOURCE]).toBeUndefined();
    expect(values[TOTAL_QUOTA_STATUS]).toBeUndefined();
  });
});

describe('buildSyncedAccountFormValues', () => {
  it('merges quota fields when quota data is available', () => {
    const values = buildSyncedAccountFormValues(mockDetail, mockQuota);

    expect(values[TOTAL_COMPUTED_QUOTA_LIMIT]).toEqual(mockQuota.totalComputedLimit);
    expect(values[TOTAL_QUOTA_USED]).toBe(mockQuota.totalUsed);
    expect(values[TOTAL_QUOTA_USED_BY_MODULE]).toEqual(mockQuota.usedByModules);
    expect(values[TOTAL_QUOTA_SOURCE]).toBe(mockQuota.totalLimitSource);
    expect(values[TOTAL_QUOTA_STATUS]).toBe(mockQuota.totalStatus);
    expect(values.uid).toBe('test-user');
    expect(values.domainName).toBe('test-domain.com');
  });

  it('leaves quota fields undefined when quota has not loaded yet', () => {
    const values = buildSyncedAccountFormValues(mockDetail);

    expect(values[TOTAL_COMPUTED_QUOTA_LIMIT]).toBeUndefined();
    expect(values[TOTAL_QUOTA_USED]).toBeUndefined();
  });
});
