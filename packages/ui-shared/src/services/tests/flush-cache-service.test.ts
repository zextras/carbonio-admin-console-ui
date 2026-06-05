/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { flushCache } from '../flush-cache-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('flushCache', () => {
	it('should call soapFetch with FlushCache and cache type only', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await flushCache('cos');

		expect(soapFetch).toHaveBeenCalledWith('FlushCache', {
			_jsns: 'urn:zimbraAdmin',
			cache: {
				type: 'cos',
				allServers: 1,
			},
		});
	});

	it('should include entry when type and value are provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await flushCache('cos', 'id', 'cos-123');

		expect(soapFetch).toHaveBeenCalledWith('FlushCache', {
			_jsns: 'urn:zimbraAdmin',
			cache: {
				type: 'cos',
				allServers: 1,
				entry: { _content: 'cos-123', by: 'id' },
			},
		});
	});

	it('should include entry with undefined value when type is provided but value is undefined', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await flushCache('account', 'name');

		expect(soapFetch).toHaveBeenCalledWith('FlushCache', {
			_jsns: 'urn:zimbraAdmin',
			cache: {
				type: 'account',
				allServers: 1,
				entry: { _content: undefined, by: 'name' },
			},
		});
	});

	it('should omit entry when type is empty string', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await flushCache('cos', '', 'value');

		expect(soapFetch).toHaveBeenCalledWith('FlushCache', {
			_jsns: 'urn:zimbraAdmin',
			cache: {
				type: 'cos',
				allServers: 1,
			},
		});
	});

	it('should call soapFetch exactly once per invocation', async () => {
		vi.mocked(soapFetch).mockResolvedValue(undefined);

		await flushCache('cos');

		expect(soapFetch).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from soapFetch', async () => {
		vi.mocked(soapFetch).mockRejectedValue(new Error('SOAP fault'));

		await expect(flushCache('cos')).rejects.toThrow('SOAP fault');
	});
});
