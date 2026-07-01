/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getQuotaUsage } from '../get-quota-usage-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getQuotaUsage', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with GetQuotaUsage and default pagination and sort', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await getQuotaUsage('example.com');

    expect(soapFetch).toHaveBeenCalledWith('GetQuotaUsage', {
      _jsns: 'urn:zimbraAdmin',
      sortBy: 'totalUsed',
      offset: 0,
      limit: 50,
      refresh: '1',
      domain: 'example.com',
      allServers: '1',
    });
  });

  it('should honor the provided offset, limit and sortBy', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await getQuotaUsage('example.com', 200, 100, 'name');

    expect(soapFetch).toHaveBeenCalledWith(
      'GetQuotaUsage',
      expect.objectContaining({ offset: 200, limit: 100, sortBy: 'name' }),
    );
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getQuotaUsage('example.com')).rejects.toThrow('SOAP fault');
  });
});
