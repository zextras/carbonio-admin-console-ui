/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	soapFetch: vi.fn(),
}));

import { soapFetch } from '@zextras/ui-shared';

import { copyCos } from '../copy-cos-service';

describe('copyCos', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sends the CopyCos request with the new name and source cos id', async () => {
		const response = { cos: [{ id: 'cos-copy-1' }] };
		vi.mocked(soapFetch).mockResolvedValue(response);

		const result = await copyCos('default-copy', 'cos-1');

		expect(soapFetch).toHaveBeenCalledWith('CopyCos', {
			_jsns: 'urn:zimbraAdmin',
			name: { _content: 'default-copy' },
			cos: { by: 'id', _content: 'cos-1' },
		});
		expect(result).toBe(response);
	});

	it('propagates the raw response when no cos is returned', async () => {
		vi.mocked(soapFetch).mockResolvedValue({});

		await expect(copyCos('default-copy', 'cos-1')).resolves.toEqual({});
	});
});
