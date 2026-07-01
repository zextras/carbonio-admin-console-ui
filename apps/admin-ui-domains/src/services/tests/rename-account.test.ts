/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { renameAccountRequest } from '../rename-account';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('renameAccountRequest', () => {
  it('should call soapFetch with RenameAccount and the given id and newName', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    const result = await renameAccountRequest('acc-1', 'new@example.com');

    expect(soapFetch).toHaveBeenCalledWith('RenameAccount', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      newName: 'new@example.com',
    });
    expect(result).toEqual({ account: [] });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(renameAccountRequest('acc-1', 'x@y.com')).rejects.toThrow('SOAP fault');
  });
});
