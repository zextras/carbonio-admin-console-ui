/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getQuotaUsageAdvance } from '../get-file-quota-accounts-usage';

vi.mock('@zextras/ui-shared', () => ({
  getSoapFetchRequest: vi.fn(),
}));

const { getSoapFetchRequest } = await import('@zextras/ui-shared');

describe('getQuotaUsageAdvance', () => {
  beforeEach(() => {
    vi.mocked(getSoapFetchRequest).mockReset();
  });

  it('should call getSoapFetchRequest with the default pagination and totalUsed sort', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({});

    await getQuotaUsageAdvance('example.com');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/services/storages/admin/quota/accounts?domain=example.com&offset=0&limit=50&sortBy=totalUsed',
    );
  });

  it('should propagate offset, limit and sortBy in the URL', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({});

    await getQuotaUsageAdvance('example.com', 100, 25, 'name');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/services/storages/admin/quota/accounts?domain=example.com&offset=100&limit=25&sortBy=name',
    );
  });

  it('should return the response from getSoapFetchRequest', async () => {
    const response = { accounts: [] };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(response);

    const result = await getQuotaUsageAdvance('example.com');

    expect(result).toEqual(response);
  });

  it('should propagate errors from getSoapFetchRequest', async () => {
    vi.mocked(getSoapFetchRequest).mockRejectedValue(new Error('REST fault'));

    await expect(getQuotaUsageAdvance('example.com')).rejects.toThrow('REST fault');
  });
});
