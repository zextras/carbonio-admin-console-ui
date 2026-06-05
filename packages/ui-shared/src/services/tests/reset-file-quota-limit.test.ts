/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { resetFileQuotaLimitById } from '../reset-file-quota-limit';

vi.mock('../../network/fetch', () => ({
	fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('../../network/fetch');

describe('resetFileQuotaLimitById', () => {
	it('should use accounts path when type is not provided', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await resetFileQuotaLimitById('acc-123');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/acc-123',
			{},
			'',
			'DELETE',
		);
	});

	it('should use accounts path when type is accounts', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await resetFileQuotaLimitById('acc-456', 'accounts');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/acc-456',
			{},
			'',
			'DELETE',
		);
	});

	it('should use cos path when type is cos', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await resetFileQuotaLimitById('cos-789', 'cos');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/cos/cos-789',
			{},
			'',
			'DELETE',
		);
	});

	it('should default to accounts path for any other type value', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await resetFileQuotaLimitById('id-999', 'unknown');

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/services/storages/admin/quota/config/accounts/id-999',
			{},
			'',
			'DELETE',
		);
	});

	it('should call fetchExternalSoap exactly once per invocation', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await resetFileQuotaLimitById('id-001');

		expect(fetchExternalSoap).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from fetchExternalSoap', async () => {
		vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('Delete failed'));

		await expect(resetFileQuotaLimitById('id-err')).rejects.toThrow('Delete failed');
	});
});
