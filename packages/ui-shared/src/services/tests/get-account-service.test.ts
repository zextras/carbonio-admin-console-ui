/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { fetchAccount } from '../get-account-service';

vi.mock('../../network/fetch', () => ({
	soapFetch: vi.fn(),
}));

const { soapFetch } = await import('../../network/fetch');

describe('fetchAccount', () => {
	it('looks an account up by id', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ account: [] });

		await fetchAccount('id', 'acc-1');

		expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
			_jsns: 'urn:zimbraAdmin',
			account: { by: 'id', _content: 'acc-1' },
		});
	});

	it('looks an account up by name with applyCos and attrs', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ account: [] });

		await fetchAccount('name', 'user@example.com', {
			applyCos: 1,
			attrs: ['zimbraId', 'zimbraMailQuota'],
		});

		expect(soapFetch).toHaveBeenCalledWith('GetAccount', {
			_jsns: 'urn:zimbraAdmin',
			account: { by: 'name', _content: 'user@example.com' },
			applyCos: 1,
			attrs: 'zimbraId,zimbraMailQuota',
		});
	});

	it('omits applyCos and attrs when not provided', async () => {
		vi.mocked(soapFetch).mockResolvedValue({ account: [] });

		await fetchAccount('name', 'user@example.com');

		const body = vi.mocked(soapFetch).mock.calls[0][1] as Record<string, unknown>;
		expect(body).not.toHaveProperty('applyCos');
		expect(body).not.toHaveProperty('attrs');
	});
});
