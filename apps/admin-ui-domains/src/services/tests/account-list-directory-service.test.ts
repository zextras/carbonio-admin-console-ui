/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ASC } from '../../constants';
import { accountListDirectory, getMailboxQuota } from '../account-list-directory-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('accountListDirectory', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with SearchDirectory and the base pagination and attrs', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await accountListDirectory('displayName', 'account', undefined, '', 0, 25);

    expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
      _jsns: 'urn:zimbraAdmin',
      offset: 0,
      limit: 25,
      applyCos: 'false',
      applyConfig: 'false',
      attrs: 'displayName',
      types: 'account',
      sortBy: undefined,
      sortAscending: 0,
    });
  });

  it('should include the domain when a non-empty domainName is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await accountListDirectory('displayName', 'account', 'example.com', '', 0, 10);

    expect(soapFetch).toHaveBeenCalledWith(
      'SearchDirectory',
      expect.objectContaining({ domain: 'example.com' }),
    );
  });

  it('should include the query when a non-empty query string is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await accountListDirectory('displayName', 'account', undefined, 'foo', 0, 10);

    expect(soapFetch).toHaveBeenCalledWith(
      'SearchDirectory',
      expect.objectContaining({ query: 'foo' }),
    );
  });

  it('should include sortBy when a non-empty sortBy string is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await accountListDirectory('displayName', 'account', undefined, '', 0, 10, 'name');

    expect(soapFetch).toHaveBeenCalledWith(
      'SearchDirectory',
      expect.objectContaining({ sortBy: 'name' }),
    );
  });

  it('should encode sortAscending as 1 when ASC and 0 otherwise', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [], searchTotal: 0 });

    await accountListDirectory('displayName', 'account', undefined, '', 0, 10, 'name', ASC);
    expect(soapFetch).toHaveBeenLastCalledWith(
      'SearchDirectory',
      expect.objectContaining({ sortAscending: 1 }),
    );

    await accountListDirectory('displayName', 'account', undefined, '', 0, 10, 'name', 'desc');
    expect(soapFetch).toHaveBeenLastCalledWith(
      'SearchDirectory',
      expect.objectContaining({ sortAscending: 0 }),
    );
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(
      accountListDirectory('displayName', 'account', undefined, '', 0, 10),
    ).rejects.toThrow('SOAP fault');
  });
});

describe('getMailboxQuota', () => {
  beforeEach(() => {
    vi.mocked(soapFetch).mockReset();
  });

  it('should call soapFetch with GetMailbox and the given mailbox id', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ mbox: { id: 'mbx-1', s: 12345 } });

    const result = await getMailboxQuota('mbx-1');

    expect(soapFetch).toHaveBeenCalledWith('GetMailbox', {
      _jsns: 'urn:zimbraAdmin',
      mbox: { id: 'mbx-1' },
    });
    expect(result).toEqual({ mbox: { id: 'mbx-1', s: 12345 } });
  });

  it('should propagate errors from soapFetch', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    await expect(getMailboxQuota('mbx-1')).rejects.toThrow('SOAP fault');
  });
});
