/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { deleteCOS } from '../delete-cos-service';

vi.mock('@zextras/ui-shared', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('deleteCOS', () => {
	it('should call soapFetch with DeleteCos and the given id', async () => {
		vi.mocked(soapFetch).mockResolvedValue({});

		const result = await deleteCOS('cos-123');

		expect(soapFetch).toHaveBeenCalledWith('DeleteCos', {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-123' },
		});
		expect(result).toEqual({});
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue({});

		await deleteCOS('cos-456');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(deleteCOS('cos-err')).rejects.toThrow('SOAP fault');
	});
});
