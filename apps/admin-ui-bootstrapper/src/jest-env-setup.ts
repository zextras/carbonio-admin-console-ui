/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, configure } from '@testing-library/react';
import dotenv from 'dotenv';
import failOnConsole from 'jest-fail-on-console';
import { noop } from 'lodash';
import { DefaultBodyType, http, StrictRequest, HttpResponse } from 'msw';
import { SetupServer } from 'msw/node';

import server from './mocks/server';

dotenv.config();

configure({
	asyncUtilTimeout: 2000
});

failOnConsole({
	shouldFailOnWarn: true,
	shouldFailOnError: true,
	silenceMessage: (errorMessage) =>
		// Warning: Failed prop type: Invalid prop `target` of type `Window` supplied to `ForwardRef(SnackbarFn)`, expected instance of `Window`
		// This warning is printed in the console for this render. This happens because window element is a jsdom representation of the window,
		// and it's an object instead of a Window class instance, so the check on the prop type fail for the target prop
		/Invalid prop `\w+`(\sof type `\w+`)? supplied to `(\w+(\(\w+\))?)`/.test(errorMessage) ||
		// errors forced from the tests
		/Controlled error/gi.test(errorMessage)
});

beforeEach(() => {
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: jest.fn(function intersectionObserverMock(
			callback: IntersectionObserverCallback,
			options: IntersectionObserverInit
		) {
			return {
				thresholds: options.threshold,
				root: options.root,
				rootMargin: options.rootMargin,
				observe: noop,
				unobserve: noop,
				disconnect: noop
			};
		})
	});

	// cleanup local storage
	window.localStorage.clear();

	jest.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
	jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
});

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'warn' });

	const retryTimes = process.env.JEST_RETRY_TIMES ? parseInt(process.env.JEST_RETRY_TIMES, 10) : 2;
	jest.retryTimes(retryTimes, { logErrorsBeforeRetry: true });
});

afterAll(() => {
	server.close();
});

afterEach(() => {
	act(() => {
		jest.runOnlyPendingTimers();
	});
	server.events.removeAllListeners();
	server.resetHandlers();
});

jest.mock<typeof import('./reporting/functions')>('./reporting/functions');

export const getSetupServer = (): SetupServer => server;

export type APIInterceptor = {
	getLastRequest: () => StrictRequest<DefaultBodyType>;
	getCalledTimes: () => number;
};

export const createAPIInterceptor = (
	method: 'get' | 'post',
	url: string,
	response: () => HttpResponse
): APIInterceptor => {
	let calledTimes = 0;
	const requests: Array<StrictRequest<DefaultBodyType>> = [];

	getSetupServer().use(
		http[method](url, async ({ request }) => {
			calledTimes += 1;
			requests.push(request);
			return response();
		})
	);

	return {
		getLastRequest: () => requests[requests.length - 1],
		getCalledTimes: () => calledTimes
	};
};

const advancedSupportedURL = '/services/catalog/services';
export const advancedSupportedApi = {
	withError: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
	withAdvancedSupported: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 })
		),
	withAdvancedNotSupported: (): APIInterceptor =>
		createAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 })
		)
};

export const minMaxVersionApi = (supplier: () => HttpResponse): APIInterceptor =>
	createAPIInterceptor('get', '/zx/auth/supported', supplier);

export const loginConfigApi = (supplier: () => HttpResponse): APIInterceptor =>
	createAPIInterceptor('get', '/zx/login/v3/config', supplier);

export const getInfoRequestApi = (supplier: () => HttpResponse): APIInterceptor =>
	createAPIInterceptor('post', '/service/admin/soap/GetInfoRequest', supplier);

export const getAllConfigRequestApi = (supplier: () => HttpResponse): APIInterceptor =>
	createAPIInterceptor('post', '/service/admin/soap/GetAllConfigRequest', supplier);
