/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { find, isArray } from 'lodash';

import { Account, ErrorSoapResponse, SoapResponse, SuccessSoapResponse } from '../../types';
import { queryClient } from '../providers/react-query-provider';
import { goToLogin } from './go-to-login';
import { userAgent } from './user-agent';
import { retry } from './utils';

const getAccountDataFromCache = (): { account?: Account; zimbraVersion: string } => {
	const account = queryClient.getQueryData<Account>(['account', 'info']);
	const zimbraVersion = queryClient.getQueryData<string>(['account', 'version']) || '';

	return { account: account || undefined, zimbraVersion };
};

const getAccount = (
	acc?: Account,
	otherAccount?: string
): { by: string; _content: string } | undefined => {
	if (otherAccount) {
		return {
			by: 'name',
			_content: otherAccount
		};
	}
	if (acc) {
		if (acc.name) {
			return {
				by: 'name',
				_content: acc.name
			};
		}
		if (acc.id) {
			return {
				by: 'id',
				_content: acc.id
			};
		}
	}
	return undefined;
};

const handleResponse = (api: string, res: SoapResponse<any>): any => {
	if (res?.Body?.Fault) {
		if (
			find(
				['service.AUTH_REQUIRED', 'service.AUTH_EXPIRED'],
				(code) => code === (<ErrorSoapResponse>res).Body.Fault.Detail?.Error?.Code
			)
		) {
			goToLogin();
		}
		const errMessage = res?.Body?.Fault?.Reason?.Text
			? res?.Body?.Fault?.Reason?.Text
			: res?.Body?.Fault?.Detail?.Error?.Detail;

		throw new Error(
			`${errMessage}
			`
		);
	}
	return (<SuccessSoapResponse<any>>res).Body[`${api}Response`] as any;
};

export const soapFetch = <Request, Response>(
	api: string,
	body: Request,
	options?: {
		otherAccount?: string;
		targetServer?: string;
		authToken?: string;
		noSession?: boolean;
	}
): Promise<Response> => {
	const { zimbraVersion, account } = getAccountDataFromCache();
	const header: any = {
		context: {
			_jsns: 'urn:zimbra',
			account: getAccount(account as Account, options?.otherAccount),
			userAgent: {
				name: userAgent,
				version: zimbraVersion
			},
			targetServer: options?.targetServer ?? undefined,
			authToken: options?.authToken ? [{ _content: options.authToken }] : undefined
		}
	};
	if (options?.noSession) {
		header.context.nosession = {};
		delete header.context.session;
	}

	const fetchFn = (): Promise<Response> =>
		fetch(`/service/admin/soap/${api}Request`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					[`${api}Request`]: body
				},
				Header: header
			})
		})
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleResponse(api, res))
			.catch((e) => {
				throw e;
			});

	return retry(fetchFn);
};

const handleSoapResponse = (res: any): any => {
	if (res?.Body?.Fault) {
		if (
			find(
				['service.AUTH_REQUIRED', 'service.AUTH_EXPIRED'],
				(code) => code === (<any>res).Body.Fault.Detail?.Error?.Code
			)
		) {
			goToLogin();
		}
		let errMessage = res?.Body?.Fault?.Reason?.Text ? res?.Body?.Fault?.Reason?.Text : res;
		if (res?.error) {
			errMessage = res?.error?.message;
		}
		throw new Error(
			`${errMessage}
		`
		);
	}
	return <SuccessSoapResponse<any>>res;
};

const fetchAccount = (
	acc?: Account,
	otherAccount?: string
): { by: string; _content: string } | undefined => {
	if (otherAccount) {
		return {
			by: 'id',
			_content: otherAccount
		};
	}
	if (acc) {
		if (acc.name) {
			return {
				by: 'name',
				_content: acc.name
			};
		}
		if (acc.id) {
			return {
				by: 'id',
				_content: acc.id
			};
		}
	}
	return undefined;
};

export const getSoapFetchRequest = <_, Response>(apiURL: string): Promise<Response> => {
	const fetchFn = (): Promise<Response> =>
		fetch(`${apiURL}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleSoapResponse(res))
			.catch((e) => {
				throw e;
			});
	return retry(fetchFn);
};

export const postSoapFetchRequest = <Request, Response>(
	apiURL: string,
	body: Request,
	api?: string,
	otherAccount?: string
): Promise<Response> => {
	const { zimbraVersion, account } = getAccountDataFromCache();
	let bodyItem: any = {};
	if (api) {
		bodyItem = {
			[`${api}`]: body
		};
	} else {
		bodyItem = body;
	}

	const fetchFn = (): Promise<Response> =>
		fetch(`${apiURL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					...bodyItem
				},
				Header: {
					context: {
						_jsns: 'urn:zimbra',
						account: fetchAccount(account as Account, otherAccount),
						userAgent: {
							name: userAgent,
							version: zimbraVersion
						}
					}
				}
			})
		})
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleSoapResponse(res));

	return retry(fetchFn);
};

export const fetchExternalSoap = <Request, Response>(
	apiURL: string,
	body: Request,
	api?: string,
	method?: string
): Promise<Response> => {
	let bodyItem;
	if (api) {
		bodyItem = {
			[`${api}`]: body
		};
	} else {
		bodyItem = body;
	}

	const fetchFn = (): Promise<Response> =>
		fetch(`${apiURL}`, {
			method: method || 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: isArray(bodyItem)
				? JSON.stringify(bodyItem)
				: JSON.stringify({
						...bodyItem
					})
		})
			.then((res) =>
				res?.headers?.get('content-length') === null &&
				!res?.headers?.get('content-type')?.includes('application/json')
					? res
					: res?.json()
			)
			.then((res: any) => handleSoapResponse(res));
	return retry(fetchFn);
};
