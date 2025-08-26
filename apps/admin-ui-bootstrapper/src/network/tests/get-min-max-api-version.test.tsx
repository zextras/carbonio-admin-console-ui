/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook } from '@testing-library/react';
import { noop } from 'lodash';
import { HttpResponse } from 'msw';

import { minMaxVersionApi } from '../../jest-env-setup';
import * as reporter from '../../reporting/functions';
import { useAdvanceStore } from '../../store/advance';
import { getMinMaxAPIVersion } from '../get-min-max-api-version';

describe('getMinMaxApiVersion', () => {
	it('sets fields in advanced store if domain present in response', async () => {
		minMaxVersionApi(() =>
			HttpResponse.json(
				{
					minApiVersion: 2,
					maxApiVersion: 3,
					domain: 'test.com'
				},
				{ status: 200 }
			)
		);
		await getMinMaxAPIVersion();
		const { result } = renderHook(() => useAdvanceStore());
		expect(result.current).toEqual({
			minApiVersion: 2,
			maxApiVersion: 3,
			domain: 'test.com'
		});
	});

	it('throw error if no domain present in response', async () => {
		minMaxVersionApi(() =>
			HttpResponse.json(
				{
					minApiVersion: 2,
					maxApiVersion: 3
				},
				{ status: 200 }
			)
		);

		await expect(getMinMaxAPIVersion).rejects.toThrow();
	});

	it('return error if api fails', async () => {
		jest.spyOn(reporter, 'report').mockImplementation((): any => noop);
		minMaxVersionApi(HttpResponse.error);

		await expect(getMinMaxAPIVersion).rejects.toThrow();
	});
});
