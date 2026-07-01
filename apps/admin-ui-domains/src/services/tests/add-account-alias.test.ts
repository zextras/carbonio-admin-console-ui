/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { addAccountAliasRequest } from '../add-account-alias';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('addAccountAliasRequest', () => {
  it('should call soapFetch with AddAccountAlias and the given id and alias', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await addAccountAliasRequest('acc-1', 'alias@example.com');

    expect(soapFetch).toHaveBeenCalledWith('AddAccountAlias', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      alias: 'alias@example.com',
    });
    expect(result).toEqual({});
  });

  it('should trim surrounding whitespace from the alias', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await addAccountAliasRequest('acc-1', '  spaced@example.com  ');

    expect(soapFetch).toHaveBeenCalledWith('AddAccountAlias', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      alias: 'spaced@example.com',
    });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(addAccountAliasRequest('acc-1', 'a@b.com')).rejects.toThrow('SOAP fault');
  });
});
