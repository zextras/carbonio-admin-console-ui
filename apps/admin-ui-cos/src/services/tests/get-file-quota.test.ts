/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getFileQuotaById } from '../get-file-quota';

vi.mock('@zextras/ui-shared', () => ({
  getSoapFetchRequest: vi.fn(),
}));

const { getSoapFetchRequest } = await import('@zextras/ui-shared');

describe('getFileQuotaById', () => {
  it('should use accounts path when type is not provided', async () => {
    const mockResponse = { limit: '1024' };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(mockResponse);

    const result = await getFileQuotaById('acc-123');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/services/storages/admin/quota/accounts/acc-123',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should use accounts path when type is accounts', async () => {
    const mockResponse = { limit: '2048' };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(mockResponse);

    const result = await getFileQuotaById('acc-456', 'accounts');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/services/storages/admin/quota/accounts/acc-456',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should use cos path when type is cos', async () => {
    const mockResponse = { limit: '4096' };
    vi.mocked(getSoapFetchRequest).mockResolvedValue(mockResponse);

    const result = await getFileQuotaById('cos-789', 'cos');

    expect(getSoapFetchRequest).toHaveBeenCalledWith('/services/storages/admin/quota/cos/cos-789');
    expect(result).toEqual(mockResponse);
  });

  it('should default to accounts path for any other type value', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({ limit: '0' });

    await getFileQuotaById('id-999', 'unknown');

    expect(getSoapFetchRequest).toHaveBeenCalledWith(
      '/services/storages/admin/quota/accounts/id-999',
    );
  });

  it('should call getSoapFetchRequest exactly once per invocation', async () => {
    vi.mocked(getSoapFetchRequest).mockResolvedValue({ limit: '0' });

    await getFileQuotaById('id-001');

    expect(getSoapFetchRequest).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from getSoapFetchRequest', async () => {
    vi.mocked(getSoapFetchRequest).mockRejectedValue(new Error('Request failed'));

    await expect(getFileQuotaById('id-err')).rejects.toThrow('Request failed');
  });
});
