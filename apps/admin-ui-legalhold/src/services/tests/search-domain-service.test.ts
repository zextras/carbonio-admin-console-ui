/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getDomainList } from '../search-domain-service';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	getDomainList: vi.fn(),
}));

const { getDomainList: searchDomains } = await import('@zextras/ui-shared');

describe('getDomainList', () => {
	it('should forward keyword, offset and limit to the shared domain search', async () => {
		vi.mocked(searchDomains).mockResolvedValue({ domain: [], searchTotal: 0, more: false, _jsns: '' });

		await getDomainList('test.com', 10, 25);

		expect(searchDomains).toHaveBeenCalledWith('test.com', 10, 25);
	});

	it('should return success with domain data', async () => {
		const domain = [{ id: 'd-1', name: 'test.com', a: [] }];
		vi.mocked(searchDomains).mockResolvedValue({ domain, searchTotal: 1, more: false, _jsns: '' });

		const result = await getDomainList('test', 0);

		expect(result).toEqual({ type: 'success', domain, searchTotal: 1, more: false });
	});

	it('should return error when the shared search rejects', async () => {
		vi.mocked(searchDomains).mockRejectedValue(new Error('too many search results returned'));

		const result = await getDomainList('a', 0);

		expect(result).toEqual({ type: 'error', error: 'too many search results returned' });
	});
});
