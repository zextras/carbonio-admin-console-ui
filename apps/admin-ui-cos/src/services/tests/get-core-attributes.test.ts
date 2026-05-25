/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getCoreAttributes } from '../get-core-attributes';

vi.mock('@zextras/ui-shared', () => ({
	fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('getCoreAttributes', () => {
	it('should call fetchExternalSoap with the correct URL and body', async () => {
		const mockResponse = {
			attributes: { zimbraPrefLocale: [{ value: 'en_US' }] },
		};
		const body = [
			{
				configType: 'cos',
				configName: ['default'],
				attrName: ['zimbraPrefLocale'],
			},
		];
		vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse);

		const result = await getCoreAttributes(body);

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attributes/get',
			body,
		);
		expect(result).toEqual(mockResponse);
	});

	it('should pass multiple requests in the body array', async () => {
		const mockResponse = {
			attributes: {
				zimbraPrefLocale: [{ value: 'en_US' }],
				zimbraPrefTimeZoneId: [{ value: 'UTC' }],
			},
		};
		const body = [
			{
				configType: 'cos',
				configName: ['default'],
				attrName: ['zimbraPrefLocale'],
			},
			{
				configType: 'global',
				configName: [undefined],
				attrName: ['zimbraPrefTimeZoneId'],
			},
		];
		vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse);

		const result = await getCoreAttributes(body);

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attributes/get',
			body,
		);
		expect(result).toEqual(mockResponse);
	});

	it('should handle an empty body array', async () => {
		const mockResponse = { attributes: {} };
		vi.mocked(fetchExternalSoap).mockResolvedValue(mockResponse);

		const result = await getCoreAttributes([]);

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attributes/get',
			[],
		);
		expect(result).toEqual(mockResponse);
	});

	it('should call fetchExternalSoap exactly once per invocation', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue({ attributes: {} });

		await getCoreAttributes([
			{ configType: 'cos', configName: ['test'], attrName: ['attr'] },
		]);

		expect(fetchExternalSoap).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from fetchExternalSoap', async () => {
		vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('Network error'));

		await expect(
			getCoreAttributes([
				{ configType: 'cos', configName: ['test'], attrName: ['attr'] },
			]),
		).rejects.toThrow('Network error');
	});
});
