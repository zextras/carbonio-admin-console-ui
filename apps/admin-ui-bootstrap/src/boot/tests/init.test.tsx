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
	getAllConfigRequestApi,
	server
} from 'admin-ui-test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse } from 'msw';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import I18nFactory from '../../i18n/i18n-factory';
import * as mockGoToLogin from '../../network/go-to-login';
import { queryClient } from '../../providers/react-query-provider';
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
	beforeEach(() => {
		server.resetHandlers();
	});

	it('should return error when advanced supported fails', async () => {
		server.use(advancedSupportedApi.withError());
		const result = await init(mocki18n);
		expect(result).toHaveProperty('error');
	});

	it('should return error when advanced supported true but other APIs fail', async () => {
		vi.spyOn(mockGoToLogin, 'goToLogin').mockImplementation(vi.fn());
		server.use(
			advancedSupportedApi.withAdvancedSupported(),
			minMaxVersionApi(() => HttpResponse.error()),
			loginConfigApi(() => HttpResponse.error()),
			getInfoRequestApi(() => HttpResponse.error()),
			getAllConfigRequestApi(() => HttpResponse.error())
		);

		const result = await init(mocki18n);
		expect(result).toHaveProperty('error');
	});

	it('should set advanced true only when all api succeed', async () => {
		vi.spyOn(mockGoToLogin, 'goToLogin').mockImplementation(vi.fn());
		server.use(
			advancedSupportedApi.withAdvancedSupported(),
			minMaxVersionApi(() =>
				HttpResponse.json({ minApiVersion: 1, maxApiVersion: 2, domain: 'test.com' }, { status: 200 })
			),
			loginConfigApi(() => HttpResponse.json({}, { status: 200 })),
			getInfoRequestApi(() => HttpResponse.json({}, { status: 200 })),
			getAllConfigRequestApi(() => HttpResponse.json({}, { status: 200 }))
		);

		// Mock the Zustand store to check if advanced is set
		const { result: advancedResult } = renderHook(() => useIsAdvanced(), {
			wrapper: ({ children }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			)
		});

		await init(new I18nFactory());

		await waitFor(() => expect(advancedResult.current).toBeTruthy());
	});
});
