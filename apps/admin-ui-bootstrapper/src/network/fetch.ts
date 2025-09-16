/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import _, { find, map } from 'lodash';

import {
	Account,
	ErrorSoapResponse,
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

const getXmlAccount = (acc?: Account, otherAccount?: string): string => {
	if (otherAccount) {
		return `<account by="name">${otherAccount}</account>`;
	}
	if (acc) {
		if (acc.name) {
			return `<account by="name">${acc.name}</account>`;
		}
		if (acc.id) {
			return `<account by="id">${acc.id}</account>`;
		}
	}
	return '';
};

const getXmlSession = (context?: any): string => {
	if (context?.session?.id) {
		return `<session id="${context?.session?.id}"/>`;
	}
	return '';
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

const handleResponse = (api: string, res: SoapResponse<any>): any => {
	const { context, noOpTimeout } = useNetworkStore.getState();
	const { usedQuota } = useAccountStore.getState();

	// @ts-ignore
	if (noOpTimeout) clearTimeout(noOpTimeout);

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
		otherAccount?: string,
		targetServer?: string,
		authToken?: string,
		noSession = false
	): Promise<Response> => {
		const { zimbraVersion, account } = useAccountStore.getState();
		const { context } = useNetworkStore.getState();
		const header: any = {
			context: {
				_jsns: 'urn:zimbra',
				session: context?.session ?? {},
				account: getAccount(account as Account, otherAccount),
				userAgent: {
					name: userAgent,
					version: zimbraVersion
				},
				targetServer: targetServer || undefined,
				authToken: authToken ? [{ _content: authToken }] : undefined
			}
		};
		if (noSession) {
			header.context.nosession = {};
			delete header.context.session;
		}
		return fetch(`/service/admin/soap/${api}Request`, {
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
		}) // TO-DO proper error handling
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleResponse(api, res))
			.catch((e) => {
				report(app)(e);
				throw e;
			}) as Promise<Response>;
	};

export const getXmlSoapFetch =
	(app: string) =>
	<Request, Response>(api: string, body: Request, otherAccount?: string): Promise<Response> => {
		const { zimbraVersion, account } = useAccountStore.getState();
		const { context } = useNetworkStore.getState();
		return fetch(`/service/admin/soap/${api}Request`, {
			method: 'POST',
			headers: {
				'content-type': 'application/soap+xml'
			},
			body: `<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
			<soap:Header><context xmlns="urn:zimbra"><userAgent name="${userAgent}" version="${zimbraVersion}"/>${getXmlSession(
				context
			)}${getXmlAccount(account, otherAccount)}<format type="js"/></context></soap:Header>
			<soap:Body>${body}</soap:Body>
		</soap:Envelope>`
		}) // TO-DO proper error handling
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleResponse(api, res))
			.catch((e) => {
				report(app)(e);
				throw e;
			}) as Promise<Response>;
	};

/* POST and GET Soap */

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

const handleSoapResponseWithErrorCode = (res: any): any => {
	if (res?.Body?.Fault) {
		if (
			find(
				['service.AUTH_REQUIRED', 'service.AUTH_EXPIRED'],
				(code) => code === (<any>res).Body.Fault.Detail?.Error?.Code
			)
		) {
			goToLogin();
		}
		throw res?.Body?.Fault ? res?.Body?.Fault : res;
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

export const getSoapFetchRequest =
	(app: string) =>
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	<Request, Response>(apiURL: string): Promise<Response> =>
		fetch(`${apiURL}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}) // TO-DO proper error handling
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleSoapResponse(res))
			.catch((e) => {
				report(app)(e);
				throw e;
			}) as Promise<Response>;

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
		return fetch(`${apiURL}`, {
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
						account: fetchAccount(account as Account, otherAccount),
						userAgent: {
							name: userAgent,
							version: zimbraVersion
						}
					}
				}
			})
		}) // TODO proper error handling
			.then((res) => res?.json())
			.then((res: SoapResponse<Response>) => handleSoapResponse(res))
			.catch((e) => {
				report(app)(e);
				throw e;
			}) as Promise<Response>;
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
		return fetch(`${apiURL}`, {
			method: method || 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: _.isArray(bodyItem)
				? JSON.stringify(bodyItem)
				: JSON.stringify({
						...bodyItem
					})
		}) // TODO proper error handling
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
			}) as Promise<Response>;
	};

export const getCarbonioBackendVersion = async (): Promise<any> => {
	const { zimbraVersion, account } = useAccountStore.getState();
	const { context } = useNetworkStore.getState();
	const request: any = {
		Body: {
			zextras: {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxCore',
				action: 'getUpdateInfo'
			}
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
				account: fetchAccount(account as Account),
				userAgent: {
					name: userAgent,
					version: zimbraVersion
				}
			}
		}
	};

	return fetch(`/service/admin/soap/zextras`, {
		method: 'POST',
		headers: {
			Accept: '*/*',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	})
		.then((res) => (res?.headers.get('content-length') === null ? res : res?.json()))
		.then((res: any) => handleSoapResponse(res))
		.catch((e) => {
			throw e;
		});
};

export const searchDirectoryListCount = async (types: string): Promise<any> => {
	const { zimbraVersion, account } = useAccountStore.getState();
	const { context } = useNetworkStore.getState();
	const request: any = {
		Body: {
			SearchDirectoryRequest: {
				_jsns: 'urn:zimbraAdmin',
				offset: 0,
				limit: 1,
				sortAscending: '1',
				applyCos: 'false',
				applyConfig: 'false',
				attrs: '',
				types
			}
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
				account: fetchAccount(account as Account),
				userAgent: {
					name: userAgent,
					version: zimbraVersion
				}
			}
		}
	};

	return fetch(`/service/admin/soap/SearchDirectoryRequest`, {
		method: 'POST',
		headers: {
			Accept: '*/*',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	})
		.then((res) => (res?.headers.get('content-length') === null ? res : res?.json()))
		.then((res: any) => handleSoapResponseWithErrorCode(res))
		.catch((e) => {
			throw e;
		});
};

export const getAllServers = async (): Promise<any> =>
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
