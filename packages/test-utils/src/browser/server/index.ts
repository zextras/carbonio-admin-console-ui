/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultBodyType, http, StrictRequest, HttpResponse, HttpResponseResolver } from 'msw';
import { setupWorker } from 'msw/browser';

const handleGetTranslations: HttpResponseResolver<never, any> = async () => HttpResponse.json({});

const defaultHandlers = [];
defaultHandlers.push(http.get('/i18n/en.json', handleGetTranslations));

const server = setupWorker(...defaultHandlers);

export type APIInterceptorForBrowser = {
	getLastRequest: () => StrictRequest<DefaultBodyType>;
	getCalledTimes: () => number;
};

const getSetupServer = () => server;

export const createAPIInterceptorForBrowser = (
	method: 'get' | 'post',
	url: string,
	response: () => HttpResponse<DefaultBodyType>
): APIInterceptorForBrowser => {
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
export const advancedSupportedApiForBrowser = {
	withError: (): APIInterceptorForBrowser =>
		createAPIInterceptorForBrowser('get', advancedSupportedURL, HttpResponse.error),
	withAdvancedSupported: (): APIInterceptorForBrowser =>
		createAPIInterceptorForBrowser('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 })
		),
	withAdvancedNotSupported: (): APIInterceptorForBrowser =>
		createAPIInterceptorForBrowser('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 })
		)
};

export const minMaxVersionApiForBrowser = (
	supplier: () => HttpResponse<DefaultBodyType>
): APIInterceptorForBrowser =>
	createAPIInterceptorForBrowser('get', '/zx/auth/supported', supplier);

export const loginConfigApiForBrowser = (
	supplier: () => HttpResponse<DefaultBodyType>
): APIInterceptorForBrowser =>
	createAPIInterceptorForBrowser('get', '/zx/login/v3/config', supplier);

export const getInfoRequestApiForBrowser = (
	supplier: () => HttpResponse<DefaultBodyType>
): APIInterceptorForBrowser =>
	createAPIInterceptorForBrowser('post', '/service/admin/soap/GetInfoRequest', supplier);

export const getAllConfigRequestApiForBrowser = (
	supplier: () => HttpResponse<DefaultBodyType>
): APIInterceptorForBrowser =>
	createAPIInterceptorForBrowser('post', '/service/admin/soap/GetAllConfigRequest', supplier);
