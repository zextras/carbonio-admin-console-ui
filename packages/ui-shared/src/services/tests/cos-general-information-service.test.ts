/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getCosGeneralInformation } from '../cos-general-information-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('getCosGeneralInformation', () => {
	it('should call soapFetch with GetCos and the cos id', async () => {
		const mockResponse = { cos: [{ id: 'cos-1', name: 'default' }] };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await getCosGeneralInformation('cos-1');

		expect(soapFetch).toHaveBeenCalledWith('GetCos', {
			_jsns: 'urn:zimbraAdmin',
			cos: { by: 'id', _content: 'cos-1' },
		});
		expect(result).toEqual(mockResponse);
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ cos: [] });

		await getCosGeneralInformation('cos-2');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(getCosGeneralInformation('cos-err')).rejects.toThrow('SOAP fault');
	});
});
