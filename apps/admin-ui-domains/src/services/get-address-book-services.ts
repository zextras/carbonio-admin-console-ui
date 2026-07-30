/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookServiceStatus, AddressBookZextrasSoapResponse } from '../../types';
import { LDAP_ADDRESS_BOOK_SERVICE, ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';

type NestedServiceInfo = {
	could_start?: boolean;
	could_stop?: boolean;
	running?: boolean;
};

type NestedGetServicesPayload = {
	response?: Record<
		string,
		{
			ok?: boolean;
			response?: {
				services?: Record<string, NestedServiceInfo>;
			};
		}
	>;
	ok?: boolean;
};

export function parseAddressBookServiceStatus(
	response: AddressBookZextrasSoapResponse,
	targetServer: string,
): AddressBookServiceStatus {
	const content = response?.Body?.response?.content;
	if (!content) {
		return { running: false, couldStart: false, couldStop: false };
	}

	const parsed = JSON.parse(content) as NestedGetServicesPayload;
	const serverResult = parsed?.response?.[targetServer];
	const service = serverResult?.response?.services?.[LDAP_ADDRESS_BOOK_SERVICE];

	return {
		running: service?.running === true,
		couldStart: service?.could_start === true,
		couldStop: service?.could_stop === true,
	};
}

export async function getAddressBookServices(
	targetServers: string,
): Promise<AddressBookServiceStatus> {
	const response = await postSoapFetchRequest<Record<string, unknown>, AddressBookZextrasSoapResponse>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'getServices',
			targetServers,
		},
		'zextras',
	);

	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? 'getServices failed');
	}

	return parseAddressBookServiceStatus(response, targetServers);
}
