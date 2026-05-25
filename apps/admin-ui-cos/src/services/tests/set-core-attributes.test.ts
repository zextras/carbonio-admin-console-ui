/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, vi } from 'vitest';

import { setCoreAttributes } from '../set-core-attributes';

vi.mock('@zextras/ui-shared', () => ({
	fetchExternalSoap: vi.fn(),
}));

const { fetchExternalSoap } = await import('@zextras/ui-shared');

describe('setCoreAttributes', () => {
	it('should call fetchExternalSoap with the correct URL and body', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		const body = { configType: 'cos', configName: 'default', attrName: 'zimbraPrefLocale', value: 'en_US' };

		await setCoreAttributes(body);

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attribute/set',
			body,
		);
	});

	it('should spread the body object correctly', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		const body = { foo: 'bar', nested: { key: 'value' } };

		await setCoreAttributes(body);

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attribute/set',
			{ ...body },
		);
	});

	it('should handle an empty body', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setCoreAttributes({});

		expect(fetchExternalSoap).toHaveBeenCalledWith(
			'/service/extension/zextras_admin/core/attribute/set',
			{},
		);
	});

	it('should call fetchExternalSoap exactly once per invocation', async () => {
		vi.mocked(fetchExternalSoap).mockResolvedValue(undefined);

		await setCoreAttributes({ key: 'value' });

		expect(fetchExternalSoap).toHaveBeenCalledTimes(1);
	});

	it('should propagate errors from fetchExternalSoap', async () => {
		vi.mocked(fetchExternalSoap).mockRejectedValue(new Error('Network error'));

		await expect(setCoreAttributes({ key: 'value' })).rejects.toThrow('Network error');
	});
});
