/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { deleteAccountAliasRequest } from '../delete-account-alias';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('deleteAccountAliasRequest', () => {
  it('should call soapFetch with RemoveAccountAlias and the given id and alias', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    const result = await deleteAccountAliasRequest('acc-1', 'alias@example.com');

    expect(soapFetch).toHaveBeenCalledWith('RemoveAccountAlias', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      alias: 'alias@example.com',
    });
    expect(result).toEqual({});
  });

  it('should trim surrounding whitespace from the alias', async () => {
    vi.mocked(soapFetch).mockResolvedValue({});

    await deleteAccountAliasRequest('acc-1', '  spaced@example.com  ');

    expect(soapFetch).toHaveBeenCalledWith('RemoveAccountAlias', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      alias: 'spaced@example.com',
    });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(deleteAccountAliasRequest('acc-1', 'a@b.com')).rejects.toThrow('SOAP fault');
  });
});
