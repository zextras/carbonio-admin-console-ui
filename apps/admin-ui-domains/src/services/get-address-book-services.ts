/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { AddressBookServiceStatus, AddressBookSoapResponse } from '../../types';
import {
	ADDRESS_BOOK_SERVICE_ENABLED,
	GET,
	ZIMBRA_ADMIN_URN,
	ZX_CONFIG,
	ZX_CONFIG_GLOBAL_ACTION,
} from '../constants';
import { parseZextrasContent } from './address-book-zextras-utils';

type AddressBookServiceEnabledValue = {
	attribute?: string;
	value?: boolean;
	inheritedValue?: boolean;
	isInherited?: boolean;
};

type AddressBookServiceEnabledResponse = {
	values?: Array<AddressBookServiceEnabledValue>;
};

export function parseAddressBookServiceStatus(
	response: AddressBookSoapResponse,
): AddressBookServiceStatus {
	const parsed = parseZextrasContent(response?.Body?.response?.content);
	const values = (parsed?.response as AddressBookServiceEnabledResponse | undefined)?.values;
	const entry = Array.isArray(values)
		? values.find((item) => item.attribute === ADDRESS_BOOK_SERVICE_ENABLED) ?? values[0]
		: undefined;

	const running =
		entry?.isInherited === true ? entry.inheritedValue === true : entry?.value === true;

	return {
		running,
		couldStart: !running,
		couldStop: running,
	};
}

export async function getAddressBookServices(): Promise<AddressBookServiceStatus> {
	const response = await postSoapFetchRequest<
		Record<string, unknown>,
		AddressBookSoapResponse
	>(
		'/service/admin/soap/zextras',
		{
			_jsns: ZIMBRA_ADMIN_URN,
			module: ZX_CONFIG,
			action: ZX_CONFIG_GLOBAL_ACTION,
			command: GET,
			attribute: ADDRESS_BOOK_SERVICE_ENABLED,
		},
		'zextras',
	);

	if (response?.Body?.Fault) {
		throw new Error(response.Body.Fault.Reason?.Text ?? 'get addressBookServiceEnabled failed');
	}

	return parseAddressBookServiceStatus(response);
}
