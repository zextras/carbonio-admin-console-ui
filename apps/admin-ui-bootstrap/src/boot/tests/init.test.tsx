/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
	advancedSupportedApi,
	minMaxVersionApi,
	loginConfigApi,
	getInfoRequestApi
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { vi, describe, it, expect } from 'vitest';

import I18nFactory from '../../i18n/i18n-factory';
import * as mockGoToLogin from '../../network/go-to-login';
import { useIsAdvanced } from '../../react-query/use-is-advanced-supported';
import { init } from '../init';

vi.mock('../../network/go-to-login', () => ({
	goToLogin: vi.fn()
}));

const mocki18n: any = {
	_cache: {},
	locale: '',
	getShellI18n: vi.fn(),
	getAppI18n: vi.fn(),
	setLocale: vi.fn()
};

describe('init', () => {
	it('should return error when advanced supported fails', async () => {
		advancedSupportedApi.withError();
		const { result } = renderHook(() => init(mocki18n));
		expect(await result.current).toHaveProperty('error');
	});

	it('should return error when advanced supported true but other APIs fail', async () => {
		vi.spyOn(mockGoToLogin, 'goToLogin').mockImplementation(vi.fn());
		advancedSupportedApi.withAdvancedSupported();
		minMaxVersionApi(() => HttpResponse.error());
		loginConfigApi(() => HttpResponse.error());
		getInfoRequestApi(() => HttpResponse.error());

		const { result } = renderHook(() => init(mocki18n));
		expect(await result.current).toHaveProperty('error');
	});

	it.skip('should set advanced true only when all api succeed', async () => {
		vi.spyOn(mockGoToLogin, 'goToLogin').mockImplementation(vi.fn());
		advancedSupportedApi.withAdvancedSupported();
		minMaxVersionApi(() =>
			HttpResponse.json({ minApiVersion: 1, maxApiVersion: 2, domain: 'test.com' }, { status: 200 })
		);
		loginConfigApi(() => HttpResponse.json({}, { status: 200 }));
		getInfoRequestApi(() => HttpResponse.json({}, { status: 200 }));

		await init(new I18nFactory());

		const { result: advancedResult } = renderHook(() => useIsAdvanced());
		await waitFor(() => expect(advancedResult.current).toBeTruthy());
	});
});
