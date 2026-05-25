/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { searchDirectory } from '../search-directory-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('searchDirectory', () => {
	it('should call soapFetch with required fields and defaults', async () => {
		const mockResponse = { cos: [], more: false, searchTotal: 0 };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await searchDirectory('zimbraId,name', 'cos', '', '');

		expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
			_jsns: 'urn:zimbraAdmin',
			limit: 50,
			offset: 0,
			sortAscending: 0,
			sortBy: undefined,
			applyCos: 'false',
			applyConfig: 'false',
			attrs: 'zimbraId,name',
			types: 'cos',
		});
		expect(result).toEqual(mockResponse);
	});

	it('should include domain when domainName is provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', 'example.com', '');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('domain', 'example.com');
	});

	it('should omit domain when domainName is empty', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).not.toHaveProperty('domain');
	});

	it('should include query when query is provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '(zimbraCOSId=123)');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('query', '(zimbraCOSId=123)');
	});

	it('should omit query when query is empty', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).not.toHaveProperty('query');
	});

	it('should include sortBy when sortBy is provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined, 'name');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('sortBy', 'name');
	});

	it('should omit sortBy when sortBy is empty', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined, '');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).not.toHaveProperty('sortBy');
	});

	it('should set sortAscending to 1 when sortAscending is asc', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined, undefined, 'asc');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('sortAscending', 1);
	});

	it('should set sortAscending to 0 when sortAscending is not asc', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined, undefined, 'desc');

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('sortAscending', 0);
	});

	it('should keep default sortAscending as string "1" when sortAscending is empty', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined, undefined, '');

		const callArgs = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(callArgs.sortAscending).toBe('1');
	});

	it('should use provided limit when limit is specified', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, 25);

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('limit', 25);
	});

	it('should use provided offset when offset is specified', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', 10);

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('offset', 10);
	});

	it('should handle all parameters provided together', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [{ id: 'cos-1' }] });

		const result = await searchDirectory(
			'zimbraId,name',
			'accounts',
			'test.com',
			'(objectClass=*)',
			20,
			100,
			'createdAt',
			'asc',
		);

		expect(soapFetch).toHaveBeenCalledWith('SearchDirectory', {
			_jsns: 'urn:zimbraAdmin',
			limit: 100,
			offset: 20,
			sortAscending: 1,
			applyCos: 'false',
			applyConfig: 'false',
			attrs: 'zimbraId,name',
			types: 'accounts',
			domain: 'test.com',
			query: '(objectClass=*)',
			sortBy: 'createdAt',
		});
		expect(result).toEqual({ cos: [{ id: 'cos-1' }] });
	});

	it('should use default offset of 0 when offset is 0 (falsy)', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', 0);

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('offset', 0);
	});

	it('should use default limit of 50 when limit is undefined', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '', undefined, undefined);

		expect(vi.mocked(soapFetch).mock.calls[0][1]).toHaveProperty('limit', 50);
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await searchDirectory('zimbraId', 'cos', '', '');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(searchDirectory('zimbraId', 'cos', '', '')).rejects.toThrow('SOAP fault');
	});
});
