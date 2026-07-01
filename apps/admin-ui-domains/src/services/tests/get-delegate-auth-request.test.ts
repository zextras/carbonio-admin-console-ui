/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getDelegateAuthRequest } from '../get-delegate-auth-request';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getDelegateAuthRequest', () => {
  it('should call soapFetch with DelegateAuth selecting the account by id when id is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ authToken: 'tok' });

    const result = await getDelegateAuthRequest('acc-1', 'name@example.com');

    expect(soapFetch).toHaveBeenCalledWith('DelegateAuth', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: 'acc-1', by: 'id' }],
    });
    expect(result).toEqual({ authToken: 'tok' });
  });

  it('should select by name when id is not provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ authToken: 'tok' });

    await getDelegateAuthRequest('', 'name@example.com');

    expect(soapFetch).toHaveBeenCalledWith('DelegateAuth', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: 'name@example.com', by: 'name' }],
    });
  });

  it('should fall back to an empty selector when neither id nor name are provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ authToken: 'tok' });

    await getDelegateAuthRequest('');

    expect(soapFetch).toHaveBeenCalledWith('DelegateAuth', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: '', by: 'name' }],
    });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getDelegateAuthRequest('acc-1')).rejects.toThrow('SOAP fault');
  });
});
