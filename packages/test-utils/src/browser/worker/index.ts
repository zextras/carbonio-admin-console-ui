/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultBodyType, http, StrictRequest, HttpResponse, HttpResponseResolver } from 'msw';
import { setupWorker } from 'msw/browser';
import { test } from 'vitest';

const handleGetTranslations: HttpResponseResolver<never, any> = async () => HttpResponse.json({});
const defaultHandlers = [http.get('/i18n/en.json', handleGetTranslations)];

export const worker = setupWorker(...defaultHandlers);

export const testExtended = test.extend({
	worker: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			// Start the worker before the test.
			await worker.start();

			// Expose the worker object on the test's context.
			await use(worker);

			// Remove any request handlers added in individual test cases.
			// This prevents them from affecting unrelated tests.
			worker.resetHandlers();
		},
		{
			auto: true
		}
	]
});

type HandlerRequest<T> = DefaultBodyType & {
	Body: Record<string, T>;
};

export type BrowserAPIInterceptor = {
	getLastRequest: () => StrictRequest<DefaultBodyType>;
	getCalledTimes: () => number;
};

export const startMockWorker = async () => {
	await worker.start({ onUnhandledRequest: 'warn' });
};

export const stopMockWorker = () => {
	worker.stop();
};

export const resetMockWorker = () => {
	worker.resetHandlers(...defaultHandlers);
};

export const createBrowserAPIInterceptor = async (
	method: 'get' | 'post',
	url: string,
	response: () => HttpResponse<DefaultBodyType>
): Promise<BrowserAPIInterceptor> => {
	let calledTimes = 0;
	const requests: Array<StrictRequest<DefaultBodyType>> = [];

	worker.use(
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

export const createBrowserSoapAPIInterceptor = <RequestParamsType, ResponseType = never>(
	apiAction: string,
	response?: ResponseType
): Promise<RequestParamsType> =>
	new Promise<RequestParamsType>((resolve, reject) => {
		worker.use(
			http.post<never, HandlerRequest<RequestParamsType>>(
				`/service/admin/soap/${apiAction}Request`,
				async ({ request }) => {
					if (!request) {
						reject(new Error('Empty request'));
						return HttpResponse.json(
							{},
							{
								status: 500,
								statusText: 'Empty request'
							}
						);
					}

					const reqActionParamWrapper = `${apiAction}Request`;
					const requestContent = await request.json();
					const params = requestContent?.Body?.[reqActionParamWrapper];
					resolve(params);

					return HttpResponse.json({
						Body: {
							[`${apiAction}Response`]: response || {}
						}
					});
				}
			)
		);
	});

const advancedSupportedURL = '/services/catalog/services';
export const advancedSupportedApiForBrowser = {
	withError: async (): Promise<BrowserAPIInterceptor> =>
		await createBrowserAPIInterceptor('get', advancedSupportedURL, HttpResponse.error),
	withAdvancedSupported: async (): Promise<BrowserAPIInterceptor> =>
		await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-advanced'] }, { status: 200 })
		),
	withAdvancedNotSupported: async (): Promise<BrowserAPIInterceptor> =>
		await createBrowserAPIInterceptor('get', advancedSupportedURL, () =>
			HttpResponse.json({ items: ['carbonio-preview', 'carbonio-mailbox'] }, { status: 200 })
		)
};

export const minMaxVersionApiForBrowser = async (
	supplier: () => HttpResponse<DefaultBodyType>
): Promise<BrowserAPIInterceptor> =>
	await createBrowserAPIInterceptor('get', '/zx/auth/supported', supplier);

export const loginConfigApiForBrowser = async (
	supplier: () => HttpResponse<DefaultBodyType>
): Promise<BrowserAPIInterceptor> =>
	await createBrowserAPIInterceptor('get', '/zx/login/v3/config', supplier);

export const getInfoRequestApiForBrowser = async (
	supplier: () => HttpResponse<DefaultBodyType>
): Promise<BrowserAPIInterceptor> =>
	await createBrowserAPIInterceptor('post', '/service/admin/soap/GetInfoRequest', supplier);

export const getAllConfigRequestApiForBrowser = async (
	supplier: () => HttpResponse<DefaultBodyType>
): Promise<BrowserAPIInterceptor> =>
	await createBrowserAPIInterceptor('post', '/service/admin/soap/GetAllConfigRequest', supplier);
