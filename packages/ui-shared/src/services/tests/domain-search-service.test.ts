/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getDomainList } from '../domain-search-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('getDomainList', () => {
	it('searches domains by keyword with the typed SearchDirectory request', async () => {
		const mockResponse = { domain: [], more: false, searchTotal: 0 };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await getDomainList('exa', 10, 20);

		expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
			_jsns: 'urn:zimbraAdmin',
			limit: 20,
			offset: 10,
			sortBy: 'zimbraDomainName',
			sortAscending: '1',
			applyCos: 'false',
			applyConfig: 'false',
			attrs: 'description,zimbraDomainName,zimbraDomainStatus,zimbraId,zimbraDomainType',
			types: 'domains',
			query: { _content: '(|(zimbraDomainName=*exa*))' },
		});
		expect(result).toEqual(mockResponse);
	});

	it('defaults to a limit of 50 and an empty query without a keyword', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ domain: [], more: false, searchTotal: 0 });

		await getDomainList(undefined, 0);

		const body = vi.mocked(soapFetch).mock.calls[0][1] as { limit: number; query: { _content: string } };
		expect(body.limit).toBe(50);
		expect(body.query._content).toBe('');
	});
});
