/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { find, isArray, map } from 'lodash';

import {
	Account,
	SoapContext,
	SoapFetch,
	SoapFetchPost,
	SoapResponse,
	SuccessSoapResponse
} from '../../types';
import { SHELL_APP_ID } from '../constants';
import { report } from '../reporting';
import { useAccountStore } from '../store/account';
import { useNetworkStore } from '../store/network';
import { handleTagSync } from '../store/tags';

import { goToLogin } from './go-to-login';
import { userAgent } from './user-agent';

async function retry<T>(
	fn: () => Promise<T>,
	options: {
		retries?: number;
		delay?: number;
		backoff?: number;
	} = {}
): Promise<T> {
	const { retries = 3, delay = 1000, backoff = 2 } = options;

	try {
		return await fn();
	} catch (error) {
		if (retries > 0) {
			await new Promise((resolve) => {
				setTimeout(resolve, delay);
			});
			return retry(fn, {
				retries: retries - 1,
				delay: delay * backoff,
				backoff
			});
		}
		throw error;
	}
}

export const noOp = (): void => {
	getSoapFetch(SHELL_APP_ID)(
		'NoOp',
		useNetworkStore.getState().pollingInterval === 500
			? { _jsns: 'urn:zimbraMail', limitToOneBlocked: 1, wait: 1 }
			: { _jsns: 'urn:zimbraMail' }
	);
};

const getAccount = (
	acc?: Account,
	otherAccount?: string,
	otherAccountBy: 'name' | 'id' = 'name'
): { by: string; _content: string } | undefined => {
	if (otherAccount) {
		return {
			by: otherAccountBy,
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

const normalizeContext = (context: any): SoapContext => {
	if (context.notify) {
		context.notify = map(context.notify, (notify) => ({
			...notify,
			deleted: notify.deleted?.id?.split(',')
		}));
	}
	return context;
};

const checkAuthError = (res: SoapResponse<any>): void => {
	if (res?.Body?.Fault) {
		if (
			find(
				['service.AUTH_REQUIRED', 'service.AUTH_EXPIRED'],
				(code) => code === res.Body.Fault.Detail?.Error?.Code
			)
		) {
			goToLogin();
		}
	}
};

const handleResponse = (api: string, res: SoapResponse<any>): any => {
	const { context, noOpTimeout } = useNetworkStore.getState();
	const { usedQuota } = useAccountStore.getState();

	// @ts-ignore
	if (noOpTimeout) clearTimeout(noOpTimeout);

	if (res?.Body?.Fault) {
		checkAuthError(res);
		const errMessage = res?.Body?.Fault?.Reason?.Text
			? res?.Body?.Fault?.Reason?.Text
			: res?.Body?.Fault?.Detail?.Error?.Detail;

		throw new Error(`${errMessage}`);
	}
	if (res?.Header?.context) {
		const responseUsedQuota =
			res.Header.context?.refresh?.mbx?.[0]?.s ?? res.Header.context?.notify?.[0]?.mbx?.[0]?.s;
		const _context = normalizeContext(res.Header.context);
		handleTagSync(_context);
		useAccountStore.setState({
			usedQuota: responseUsedQuota ?? usedQuota
		});
		useNetworkStore.setState({
			context: {
				...context,
				...res?.Header?.context
			}
		});
	}
	return (<SuccessSoapResponse<any>>res).Body[`${api}Response`] as any;
};
export const getSoapFetch =
	(app: string): SoapFetch =>
	<Request, Response>(
		api: string,
		body: Request,
		options?: {
			otherAccount?: string;
			targetServer?: string;
			authToken?: string;
			noSession?: boolean;
		}
	): Promise<Response> => {
		const { zimbraVersion, account } = useAccountStore.getState();
		const { context } = useNetworkStore.getState();
		const header: any = {
			context: {
				_jsns: 'urn:zimbra',
				session: context?.session ?? {},
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
					report(app)(e);
					throw e;
				});

		return retry(fetchFn);
	};

/* POST and GET Soap */

const handleSoapResponse = (res: any): any => {
	if (res?.Body?.Fault) {
		checkAuthError(res);
		let errMessage = res?.Body?.Fault?.Reason?.Text ? res?.Body?.Fault?.Reason?.Text : res;
		if (res?.error) {
			errMessage = res?.error?.message;
		}
		throw new Error(`${errMessage}`);
	}
	return <SuccessSoapResponse<any>>res;
};

export const getSoapFetchRequest =
	(app: string) =>
	<_, Response>(apiURL: string): Promise<Response> => {
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
					report(app)(e);
					throw e;
				});

		return retry(fetchFn);
	};

export const postSoapFetchRequest =
	(app: string): SoapFetchPost =>
	<Request, Response>(
		apiURL: string,
		body: Request,
		api?: string,
		otherAccount?: string
	): Promise<Response> => {
		const { zimbraVersion, account } = useAccountStore.getState();
		const { context } = useNetworkStore.getState();
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
							notify: context?.notify?.[0]?.seq
								? {
										seq: context?.notify?.[0]?.seq
									}
								: undefined,
							session: context?.session ?? {},
							account: getAccount(account as Account, otherAccount, 'id'),
							userAgent: {
								name: userAgent,
								version: zimbraVersion
							}
						}
					}
				})
			})
				.then((res) => res?.json())
				.then((res: SoapResponse<Response>) => handleSoapResponse(res))
				.catch((e) => {
					report(app)(e);
					throw e;
				});

		return retry(fetchFn);
	};

export const fetchExternalSoap =
	(app: string) =>
	<Request, Response>(
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
				.then((res: any) => handleSoapResponse(res))
				.catch((e) => {
					report(app)(e);
					throw e;
				});

		return retry(fetchFn);
	};

export const getAllServers = async (): Promise<any> => {
	const fetchFn = (): Promise<any> =>
		fetch(`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`, {
			method: 'GET',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/json'
			}
		})
			.then((res) => (res?.headers.get('content-length') === null ? res : res?.json()))
			.then((res: any) => handleSoapResponse(res))
			.catch((e) => {
				throw e;
			});

	return retry(fetchFn);
};
