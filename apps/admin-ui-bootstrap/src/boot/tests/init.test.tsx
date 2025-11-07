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
	getInfoRequestApi,
	getAllConfigRequestApi
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { vi, describe, it, expect } from 'vitest';

import I18nFactory from '../../i18n/i18n-factory';
import * as mockGoToLogin from '../../network/go-to-login';
import { useIsAdvanced } from '../../store/advance';
import { init } from '../init';

vi.mock('../../network/go-to-login', () => ({
	goToLogin: vi.fn()
}));

// Mock global fetch for components.json
const originalFetch = globalThis.fetch;
globalThis.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
	let urlString: string;
	if (typeof url === 'string') {
		urlString = url;
	} else if (url instanceof URL) {
		urlString = url.toString();
	} else {
		urlString = url.url;
	}
	
	if (urlString.includes('/static/iris/components.json')) {
		return Promise.resolve({
			json: () => Promise.resolve({ components: [] }),
			ok: true,
			status: 200
		} as Response);
	}
	return originalFetch(url, init);
});

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
		minMaxVersionApi(HttpResponse.error);
		loginConfigApi(HttpResponse.error);
		getInfoRequestApi(HttpResponse.error);
		getAllConfigRequestApi(HttpResponse.error);

		const { result } = renderHook(() => init(mocki18n));
		expect(await result.current).toHaveProperty('error');
	});

	it('should set advanced true only when all api succeed', async () => {
		vi.spyOn(mockGoToLogin, 'goToLogin').mockImplementation(vi.fn());
		advancedSupportedApi.withAdvancedSupported();
		minMaxVersionApi(() =>
			HttpResponse.json({ minApiVersion: 1, maxApiVersion: 2, domain: 'test.com' }, { status: 200 })
		);
		loginConfigApi(() => HttpResponse.json({}, { status: 200 }));
		getInfoRequestApi(() =>
			HttpResponse.json(
				{
					Body: {
						GetInfoResponse: {
							name: 'admin@test.com',
							version: '9.0.0',
							_attrs: {},
							prefs: { _attrs: {} }
						}
					},
					Header: { context: {} }
				},
				{ status: 200 }
			)
		);
		getAllConfigRequestApi(() =>
			HttpResponse.json(
				{
					Body: {
						GetAllConfigResponse: {
							a: []
						}
					},
					Header: { context: {} }
				},
				{ status: 200 }
			)
		);

		await init(new I18nFactory());

		const { result: advancedResult } = renderHook(() => useIsAdvanced());
		await waitFor(() => expect(advancedResult.current).toBeTruthy());
	});
});
