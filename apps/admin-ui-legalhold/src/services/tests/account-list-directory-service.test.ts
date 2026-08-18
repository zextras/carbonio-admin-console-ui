/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import {
  accountListDirectory,
  mergeDirectorySearchResults,
} from '../account-list-directory-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

const account = { id: 'acc-1', name: 'admin@test.com', a: [] };
const excluded = { id: 'hold-1', name: 'hold@test.com', a: [] };
const dl = { id: 'dl-1', name: 'team@test.com', a: [] };

describe('mergeDirectorySearchResults', () => {
  it('should tag accounts as usr and distribution lists as grp', () => {
    expect(mergeDirectorySearchResults({ account: [account], dl: [dl] })).toEqual([
      { ...account, type: 'usr' },
      { ...dl, type: 'grp' },
    ]);
  });

  it('should exclude the legal hold account id', () => {
    expect(
      mergeDirectorySearchResults({ account: [account, excluded], dl: [] }, 'hold-1'),
    ).toEqual([{ ...account, type: 'usr' }]);
  });
});

describe('accountListDirectory', () => {
  it('should call soapFetch with optional domain and query', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [account] });

    await accountListDirectory({
      attr: 'displayName,zimbraId',
      type: 'distributionlists,accounts',
      domainName: 'test.com',
      query: '(mail=*admin*)',
      offset: 0,
      limit: 10,
    });

    expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
      _jsns: 'urn:zimbraAdmin',
      offset: 0,
      limit: 10,
      applyCos: 'false',
      applyConfig: 'false',
      attrs: 'displayName,zimbraId',
      types: 'distributionlists,accounts',
      domain: 'test.com',
      query: '(mail=*admin*)',
    });
  });

  it('should omit domain and query when they are empty', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [] });

    await accountListDirectory({
      attr: 'displayName',
      type: 'accounts',
      domainName: '',
      query: '',
      offset: 0,
      limit: 10,
    });

    expect(soapFetch).toHaveBeenCalledWith(
      'SearchDirectory',
      expect.not.objectContaining({ domain: expect.anything(), query: expect.anything() }),
    );
  });

  it('should return merged accounts on success', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ account: [account, excluded], dl: [dl] });

    const result = await accountListDirectory({
      attr: 'displayName',
      type: 'accounts',
      domainName: '',
      query: '',
      offset: 0,
      limit: 10,
      excludeAccountId: 'hold-1',
    });

    expect(result).toEqual({
      type: 'success',
      accounts: [
        { ...account, type: 'usr' },
        { ...dl, type: 'grp' },
      ],
    });
  });

  it('should return error when soapFetch rejects', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

    const result = await accountListDirectory({
      attr: 'displayName',
      type: 'accounts',
      domainName: '',
      query: '',
      offset: 0,
      limit: 10,
    });

    expect(result).toEqual({ type: 'error', error: 'SOAP fault' });
  });
});
