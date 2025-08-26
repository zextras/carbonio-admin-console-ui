/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const modifyAccountRequest = async (id: string, modifiedData: any): Promise<any> => {
	const attrList: { n: string; _content: string }[] = [];
	Object.keys(modifiedData).forEach((ele: any): void => {
		if (
			[
				'zimbraMailForwardingAddress',
				'zimbraPrefCalendarForwardInvitesTo',
				'zimbraAllowFromAddress'
			].includes(ele)
		) {
			if (modifiedData[ele]?.trim()) {
				modifiedData[ele]?.split(', ')?.map((el: any) => attrList.push({ n: ele, _content: el }));
			} else {
				attrList.push({ n: ele, _content: modifiedData[ele] });
			}
		} else {
			attrList.push({ n: ele, _content: modifiedData[ele] });
		}
	});
	const request: any = {
		_jsns: 'urn:zimbraAdmin',
		id,
		a: attrList
	};

	return soapFetch(`ModifyAccount`, {
		...request
	});
};
