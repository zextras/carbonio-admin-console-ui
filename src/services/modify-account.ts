/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const modifyAccountRequest = async (id: string, modifiedData: any): Promise<any> => {
	const attrList: { n: string; _content: string }[] = [];
	Object.keys(modifiedData).forEach((ele: any): void => {
		if (['zimbraMailForwardingAddress', 'zimbraPrefCalendarForwardInvitesTo'].includes(ele)) {
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
		ModifyAccountRequest: {
			_jsns: 'urn:zimbraAdmin',
			id,
			a: attrList
		}
	};

	return fetch(`/service/admin/soap/ModifyAccountRequest`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Header: {
				context: {
					_jsns: 'urn:zimbra',
					session: {}
				}
			},
			Body: request
		})
	});
};
