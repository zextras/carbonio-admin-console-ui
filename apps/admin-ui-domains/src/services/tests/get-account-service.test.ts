/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getAccount } from '../get-account-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getAccount', () => {
  it('should call soapFetch with GetAccount and a single account selector by id', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    const result = await getAccount('acc-1');

    expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
      _jsns: 'urn:zimbraAdmin',
      account: { by: 'id', _content: 'acc-1' },
    });
    expect(result).toEqual({ account: [] });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getAccount('acc-1')).rejects.toThrow('SOAP fault');
  });
});
