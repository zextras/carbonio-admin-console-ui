/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DefaultBodyType, http, StrictRequest, HttpResponse } from 'msw';
import { SetupServer } from 'msw/node';

import server from '../mocks/server';

export type APIInterceptor = {
	getLastRequest: () => StrictRequest<DefaultBodyType>;
	getCalledTimes: () => number;
};

export const getSetupServer = (): SetupServer => server;

export const createAPIInterceptor = (
	method: 'get' | 'post',
	url: string,
	response: () => HttpResponse<DefaultBodyType>
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
