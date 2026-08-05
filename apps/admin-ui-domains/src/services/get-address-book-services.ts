/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookServiceStatus, AddressBookZextrasSoapResponse } from '../../types';
import { LDAP_ADDRESS_BOOK_SERVICE, ZIMBRA_ADMIN_URN, ZX_ADDRESS_BOOK } from '../constants';
import { parseZextrasContent } from './address-book-zextras-utils';

type ServiceInfo = {
	could_start?: boolean;
	could_stop?: boolean;
	running?: boolean;
};

export function parseAddressBookServiceStatus(
	response: AddressBookZextrasSoapResponse,
): AddressBookServiceStatus {
	const parsed = parseZextrasContent(response?.Body?.response?.content);
	const service = (
		parsed?.response as { services?: Record<string, ServiceInfo> } | undefined
	)?.services?.[LDAP_ADDRESS_BOOK_SERVICE];

	return {
		running: service?.running === true,
		couldStart: service?.could_start === true,
		couldStop: service?.could_stop === true,
	};
}

export async function getAddressBookServices(): Promise<AddressBookServiceStatus> {
	const response = await postSoapFetchRequest<Record<string, unknown>, AddressBookZextrasSoapResponse>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_ADDRESS_BOOK,
			action: 'getServices',
		},
		'zextras',
	);

	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? 'getServices failed');
	}

	return parseAddressBookServiceStatus(response);
}
