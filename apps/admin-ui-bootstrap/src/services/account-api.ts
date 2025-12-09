/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GetInfoResponse, AccountSettings, Account } from '../../types';

const normalizeSettings = (
	settings: Pick<GetInfoResponse, 'attrs' | 'prefs' | 'props'>
): AccountSettings => ({
	attrs: settings.attrs._attrs,
	prefs: settings.prefs._attrs,
	props: settings.props.prop ?? []
});

const normalizeAccount = ({
	id,
	name,
	attrs,
	prefs,
	identities,
	signatures,
	props,
	version,
	rights
}: GetInfoResponse): {
	account: Account;
	settings: AccountSettings;
	version: string;
} => {
	const settings = normalizeSettings({ attrs, prefs, props });
	return {
		account: {
			id,
			name,
			displayName: attrs._attrs.displayName,
			identities,
			signatures,
			rights
		},
		settings,
		version
	};
};

const directSoapFetch = async <Request, Response>(
	api: string,
	body: Request
): Promise<Response> => {
	const res = await fetch(`/service/admin/soap/${api}Request`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				[`${api}Request`]: body
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	});

	const response = await res.json();

	if (response?.Body?.Fault) {
		if (
			['service.AUTH_REQUIRED', 'service.AUTH_EXPIRED'].includes(
				response.Body.Fault.Detail?.Error?.Code
			)
		) {
			window.location.href = '/login';
		}
		const errMessage = response?.Body?.Fault?.Reason?.Text
			? response?.Body?.Fault?.Reason?.Text
			: response?.Body?.Fault?.Detail?.Error?.Detail;

		throw new Error(`${errMessage}`);
	}

	return response.Body[`${api}Response`] as Response;
};

export const fetchAccountInfo = async (): Promise<Account> => {
	const response = await directSoapFetch<{ _jsns: string; rights: string }, GetInfoResponse>(
		'GetInfo',
		{
			_jsns: 'urn:zimbraAccount',
			rights: 'sendAs,sendAsDistList,viewFreeBusy,sendOnBehalfOf,sendOnBehalfOfDistList'
		}
	);

	if (!response) {
		throw new Error('Failed to fetch account info: No response received');
	}

	const { account } = normalizeAccount(response);
	return account as Account;
};

export const fetchAccountSettings = async (): Promise<AccountSettings> => {
	const response = await directSoapFetch<{ _jsns: string; sections: string }, GetInfoResponse>(
		'GetInfo',
		{
			_jsns: 'urn:zimbraAccount',
			sections: 'prefs,attrs,props,zimlets'
		}
	);

	if (!response) {
		throw new Error('Failed to fetch account settings: No response received');
	}

	const { settings } = normalizeAccount(response);
	return settings;
};
