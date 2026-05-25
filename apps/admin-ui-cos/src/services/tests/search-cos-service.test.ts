/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getCosList } from '../search-cos-service';

vi.mock('@zextras/ui-shared', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('getCosList', () => {
	it('should call soapFetch with SearchDirectory and default pagination', async () => {
		const mockResponse = { cos: [], more: false, searchTotal: 0 };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await getCosList('');

		expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			_jsns: 'urn:zimbraAdmin',
			limit: 50,
			offset: 0,
			sortBy: 'cn',
			sortAscending: '1',
			applyCos: 'false',
			applyConfig: 'false',
			attrs: 'cn,description',
			types: 'coses',
			query: { _content: '' },
		});
		expect(result).toEqual(mockResponse);
	});

	it('should include search keyword in query when provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('test');

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.query).toEqual({ _content: '(|(cn=*test*))' });
	});

	it('should use empty query when search keyword is empty string', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('');

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.query).toEqual({ _content: '' });
	});

	it('should use provided limit and offset', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('test', 25, 10);

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.limit).toBe(25);
		expect(callArgs.offset).toBe(10);
	});

	it('should default limit to 50 when not provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('', undefined, 0);

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.limit).toBe(50);
	});

	it('should default offset to 0 when not provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('', 10);

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.offset).toBe(0);
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosList('test');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(getCosList('test')).rejects.toThrow('SOAP fault');
	});
});
