/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { getDomainInformation } from '../get-domain-information';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('getDomainInformation', () => {
	it('should call soapFetch with GetDomain and the domain id with default applyConfig', async () => {
		const mockResponse = { domain: [{ id: 'domain-1', name: 'example.com' }] };
		vi.mocked(soapFetch).mockResolvedValue(mockResponse);

		const result = await getDomainInformation('domain-1');

		expect(soapFetch).toHaveBeenCalledWith('GetDomain', {
			_jsns: 'urn:zimbraAdmin',
			domain: { by: 'id', _content: 'domain-1' },
			applyConfig: 1,
		});
		expect(result).toEqual(mockResponse);
	});

	it('should pass applyConfig through when provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ domain: [] });

		await getDomainInformation('domain-2', 0);

		expect(soapFetch).toHaveBeenCalledWith('GetDomain', {
			_jsns: 'urn:zimbraAdmin',
			domain: { by: 'id', _content: 'domain-2' },
			applyConfig: 0,
		});
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ domain: [] });

		await getDomainInformation('domain-3');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(getDomainInformation('domain-err')).rejects.toThrow('SOAP fault');
	});
});
