/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { modifyAccountRequest } from '../modify-account';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('modifyAccountRequest', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with ModifyAccount and the given id and attribute list', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await modifyAccountRequest('acc-1', { displayName: 'John' });

    expect(soapFetch).toHaveBeenCalledWith('ModifyAccount', {
      _jsns: 'urn:zimbraAdmin',
      id: 'acc-1',
      a: [{ n: 'displayName', _content: 'John' }],
    });
  });

  it('should split comma-separated values for multi-valued forwarding fields', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await modifyAccountRequest('acc-1', {
      zimbraMailForwardingAddress: 'a@b.com, c@d.com',
    });

    expect(soapFetch).toHaveBeenCalledWith(
      'ModifyAccount',
      expect.objectContaining({
        a: [
          { n: 'zimbraMailForwardingAddress', _content: 'a@b.com' },
          { n: 'zimbraMailForwardingAddress', _content: 'c@d.com' },
        ],
      }),
    );
  });

  it('should keep an empty forwarding value as a single attribute to clear it', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await modifyAccountRequest('acc-1', { zimbraMailForwardingAddress: '' });

    expect(soapFetch).toHaveBeenCalledWith(
      'ModifyAccount',
      expect.objectContaining({
        a: [{ n: 'zimbraMailForwardingAddress', _content: '' }],
      }),
    );
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(modifyAccountRequest('acc-1', { displayName: 'x' })).rejects.toThrow(
      'SOAP fault',
    );
  });
});
