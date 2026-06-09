/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { modifyCos } from '../modify-cos-service';

vi.mock('@zextras/ui-shared', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('modifyCos', () => {
	it('should call soapFetch with ModifyCos and the provided body', async () => {
		const mockResponse = { cos: [{ id: 'cos-1', name: 'modified' }] };
		const body = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-1' },
			a: [{ n: 'zimbraPrefLocale', _content: 'en_US' }],
		};
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await modifyCos(body);

		expect(soapFetch).toHaveBeenCalledWith('ModifyCos', body);
		expect(result).toEqual(mockResponse);
	});

	it('should spread the body object correctly', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		const body = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-2' },
			a: [
				{ n: 'zimbraPrefLocale', _content: 'it_IT' },
				{ n: 'zimbraPrefTimeZoneId', _content: 'Europe/Rome' },
			],
		};

		await modifyCos(body);

		expect(soapFetch).toHaveBeenCalledWith('ModifyCos', { ...body });
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await modifyCos({
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-3' },
			a: [{ n: 'attr', _content: 'val' }],
		});

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(
			modifyCos({
				_jsns: 'urn:zimbraAdmin',
				id: { _content: 'cos-err' },
				a: [{ n: 'attr', _content: 'val' }],
			}),
		).rejects.toThrow('SOAP fault');
	});
});
