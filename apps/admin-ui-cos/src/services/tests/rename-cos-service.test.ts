/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { renameCos } from '../rename-cos-service';

vi.mock('@zextras/ui-shared', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('@zextras/ui-shared');

describe('renameCos', () => {
	it('should call soapFetch with RenameCos and the provided body', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		const body = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-123' },
			newName: { _content: 'renamed-cos' },
		};

		await renameCos(body);

		expect(soapFetch).toHaveBeenCalledWith('RenameCos', body);
	});

	it('should spread the body object correctly', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		const body = {
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-456' },
			newName: { _content: 'new-name' },
		};

		await renameCos(body);

		expect(soapFetch).toHaveBeenCalledWith('RenameCos', { ...body });
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await renameCos({
			_jsns: 'urn:zimbraAdmin',
			id: { _content: 'cos-789' },
			newName: { _content: 'another-name' },
		});

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(
			renameCos({
				_jsns: 'urn:zimbraAdmin',
				id: { _content: 'cos-err' },
				newName: { _content: 'fail' },
			}),
		).rejects.toThrow('SOAP fault');
	});
});
