/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { minMaxVersionApi } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect,it } from 'vitest';

import { queryFnVersionInfo } from '../../react-query/use-advanced-version-info';

describe('queryFnVersionInfo', () => {
	it('returns version info if domain present in response', async () => {
		minMaxVersionApi(() =>
			HttpResponse.json(
				{
					minApiVersion: 2,
					maxApiVersion: 3,
					domain: 'test.com',
					version: '1.0.0'
				},
				{ status: 200 }
			)
		);

		const result = await queryFnVersionInfo();

		expect(result).toEqual({
			minApiVersion: 2,
			maxApiVersion: 3,
			domain: 'test.com',
			version: '1.0.0'
		});
	});

	it('returns null if no domain present in response', async () => {
		minMaxVersionApi(() =>
			HttpResponse.json(
				{
					minApiVersion: 2,
					maxApiVersion: 3
				},
				{ status: 200 }
			)
		);

		const result = await queryFnVersionInfo();
		expect(result).toBeNull();
	});

	it('returns null if api fails', async () => {
		minMaxVersionApi(HttpResponse.error);

		const result = await queryFnVersionInfo();
		expect(result).toBeNull();
	});
});
