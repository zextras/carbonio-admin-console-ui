/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';

import { getDomainList } from '../search-domain-service';

vi.mock('@zextras/ui-shared', () => ({
  soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getDomainList', () => {
  it('should call soapFetch with a domain query when a keyword is provided', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ domain: [], searchTotal: 0, more: false });

    await getDomainList('test.com', 0);

    expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
      _jsns: 'urn:zimbraAdmin',
      limit: 50,
      offset: 0,
      sortBy: 'zimbraDomainName',
      sortAscending: '1',
      applyCos: 'false',
      applyConfig: 'false',
      attrs: 'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType',
      types: 'domains',
      query: { _content: '(|(zimbraDomainName=*test.com*))' },
    });
  });

  it('should send an empty query when the keyword is empty', async () => {
    vi.mocked(soapFetch).mockResolvedValue({ domain: [], searchTotal: 0, more: false });

    await getDomainList('', 10, 25);

    expect(soapFetch).toHaveBeenCalledWith(
      'SearchDirectory',
      expect.objectContaining({
        limit: 25,
        offset: 10,
        query: { _content: '' },
      }),
    );
  });

  it('should return success with domain data', async () => {
    const domain = [{ id: 'd-1', name: 'test.com', a: [] }];
    vi.mocked(soapFetch).mockResolvedValue({ domain, searchTotal: 1, more: false, _jsns: '' });

    const result = await getDomainList('test', 0);

    expect(result).toEqual({ type: 'success', domain, searchTotal: 1, more: false });
  });

  it('should return error when soapFetch rejects', async () => {
    vi.mocked(soapFetch).mockRejectedValue(new Error('too many search results returned'));

    const result = await getDomainList('a', 0);

    expect(result).toEqual({ type: 'error', error: 'too many search results returned' });
  });
});
