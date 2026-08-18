/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getBackupAccounts } from '../get-backup-accounts';

vi.mock('@zextras/ui-shared', () => ({
  getSoapFetchRequest: vi.fn(),
}));

const { getSoapFetchRequest } = await import('@zextras/ui-shared');

const params = {
  domain: 'test.com',
  filter: 'admin',
  legalHold: false,
  page: 0,
  pageSize: 10,
};

describe('getBackupAccounts', () => {
  it('should call getSoapFetchRequest with the backup accounts URL', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({ accounts: [], maxPage: 0 });

    await getBackupAccounts(params);

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/service/extension/zextras_admin/backup/getBackupAccounts?page=0&pageSize=10&domains=test.com&filter=admin&legalHold=false',
    );
  });

  it('should return success with parsed accounts', async () => {
    const accounts = [
      {
        id: 'acc-1',
        name: 'admin@test.com',
        status: 'active',
        legalHold: 'false',
        serverName: 'mailstore1.test.com',
        creationTimestamp: 1,
      },
    ];
    vi.mocked(getSoapFetchRequest).mockResolvedValue({ accounts, maxPage: 2 });

    const result = await getBackupAccounts(params);

    expect(result).toEqual({ type: 'success', accounts, maxPage: 2 });
  });

  it('should return error when all_server contains an error message', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({
      all_server: { error: { message: 'Backup unavailable' } },
    });

    const result = await getBackupAccounts(params);

    expect(result).toEqual({ type: 'error', error: 'Backup unavailable' });
  });

  it('should return error when getSoapFetchRequest rejects', async () => {
    vi.mocked(getSoapFetchRequest).mockRejectedValue(new Error('Network error'));

    const result = await getBackupAccounts(params);

    expect(result).toEqual({ type: 'error', error: 'Network error' });
  });
});
