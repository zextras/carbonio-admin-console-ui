/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { setFileQuotaLimitById } from '../set-file-quota-limit';

vi.mock('@zextras/ui-shared', () => ({
	fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('setFileQuotaLimitById', () => {
	it('should use accounts path when type is not provided', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setFileQuotaLimitById('acc-123', '1024');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/acc-123',
			{ limit: '1024' },
			'',
			'PUT',
		);
	});

	it('should use accounts path when type is accounts', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setFileQuotaLimitById('acc-456', '2048', 'accounts');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/acc-456',
			{ limit: '2048' },
			'',
			'PUT',
		);
	});

	it('should use cos path when type is cos', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setFileQuotaLimitById('cos-789', '4096', 'cos');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/cos/cos-789',
			{ limit: '4096' },
			'',
			'PUT',
		);
	});

	it('should default to accounts path for any other type value', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setFileQuotaLimitById('id-999', '8192', 'unknown');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/id-999',
			{ limit: '8192' },
			'',
			'PUT',
		);
	});

	it('should call fetchExternalSoap exactly once per invocation', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setFileQuotaLimitById('id-001', '100');

		expect(fetchExternalSoap).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from fetchExternalSoap', async () => {
		vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('Update failed'));

		await expect(setFileQuotaLimitById('id-err', '0')).rejects.toThrow('Update failed');
	});
});
