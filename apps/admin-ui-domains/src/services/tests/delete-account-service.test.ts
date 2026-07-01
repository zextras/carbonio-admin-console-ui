/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { deleteAccount } from '../delete-account-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('deleteAccount', () => {
  it('should call soapFetch with DeleteAccount and the given account id', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await deleteAccount('acc-1');

    expect(soapFetch).toHaveBeenCalledWith('DeleteAccount', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
    });
    expect(result).toEqual({});
  });

  it('should call soapFetch exactly once per invocation', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await deleteAccount('acc-2');

    expect(soapFetch).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(deleteAccount('acc-err')).rejects.toThrow('SOAP fault');
  });
});
