/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAccountRequest } from '../get-account';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getAccountRequest', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should build a request selecting the account by id when id is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await getAccountRequest('acc-1', 'ignored@example.com', 0);

    expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: 'acc-1', by: 'id' }],
      applyCos: 0,
    });
  });

  it('should build a request selecting the account by name when id is empty', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await getAccountRequest('', 'name@example.com', 1);

    expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
      _jsns: 'urn:zimbraAdmin',
      account: [{ _content: 'name@example.com', by: 'name' }],
      applyCos: 1,
    });
  });

  it('should append the joined attrs when attrs are provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await getAccountRequest('acc-1', '', 0, ['displayName', 'zimbraId']);

    expect(soapFetch).toHaveBeenCalledWith(
      'GetAccount',
      expect.objectContaining({ attrs: 'displayName,zimbraId' }),
    );
  });

  it('should not include the attrs field when attrs is undefined or empty', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await getAccountRequest('acc-1', '', 0, []);

    const [, payload] = vi.mocked(soapFetch).mock.calls[0];
    expect(payload).not.toHaveProperty('attrs');
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getAccountRequest('acc-1', '', 0)).rejects.toThrow('SOAP fault');
  });
});
