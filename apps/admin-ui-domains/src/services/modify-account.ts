/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { ModifyAccountRequest, ModifyAccountResponse, SoapAttribute } from '../../types';


export const modifyAccountRequest = async (id: string, modifiedData: Record<string, string>): Promise<ModifyAccountResponse> => {
	const attrList: Array<SoapAttribute> = [];
	Object.keys(modifiedData).forEach((ele: string): void => {
		if (
			[
				'zimbraMailForwardingAddress',
				'zimbraPrefCalendarForwardInvitesTo',
				'zimbraAllowFromAddress'
			].includes(ele)
		) {
			if (modifiedData[ele]?.trim()) {
				modifiedData[ele]?.split(', ')?.map((el: string) => attrList.push({ n: ele, _content: el }));
			} else {
				attrList.push({ n: ele, _content: modifiedData[ele] });
			}
		} else {
			attrList.push({ n: ele, _content: modifiedData[ele] });
		}
	});
	const request: ModifyAccountRequest = {
		_jsns: 'urn:zimbraAdmin',
		id,
		a: attrList
	};

	return soapFetch<ModifyAccountRequest, ModifyAccountResponse>(`ModifyAccount`, {
		...request
	});
};
