/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ALL, DL, EDOM, EMAIL, GRP, GST, PUB, USR } from '../../../../constants';

type SoapAttribute = { n?: string; _content?: string };
type SoapGrantee = { id?: string; name?: string; type?: string };

export type DistributionListDetail = {
	dlId: string;
	dlm: Array<string>;
	zimbraHideInGal: boolean;
	zimbraNotes: string;
	description: string;
	sendShareMessageToNewMembers: boolean;
	aliases: Array<{ label: string }>;
	createTimestamp: string;
	mailStatusEnabled: boolean;
	memberURL: string | undefined;
	isACLGroup: boolean;
};

export type DistributionListGrants = {
	grantType: string;
	grantEmails: Array<{ id: string; name: string }>;
	owners: Array<{ id: string; name: string }>;
	sendAs: Array<{ id: string; name: string; sendAcl: string }>;
};

export type DistributionListMemberOf = {
	id: string;
	name: string;
};

function findAttributeContent(attributes: Array<SoapAttribute> | undefined, name: string): string | undefined {
	return attributes?.find((attribute) => attribute?.n === name)?._content;
}

export function parseDistributionListDetail(
	response: { dl?: Array<{ id?: string; dlm?: Array<{ _content?: string }>; a?: Array<SoapAttribute> }> } | undefined,
	listName: string | undefined
): DistributionListDetail | undefined {
	const distributionList = response?.dl?.[0];
	if (!distributionList) {
		return undefined;
	}

	const attributes = distributionList.a ?? [];
	const aliases = (attributes
		.filter((attribute) => attribute?.n === 'zimbraMailAlias' && attribute?._content !== listName)
		.map((attribute) => ({ label: attribute?._content ?? '' })));

	return {
		dlId: distributionList.id ?? '',
		dlm: distributionList.dlm?.map((item) => item?._content ?? '') ?? [],
		zimbraHideInGal: findAttributeContent(attributes, 'zimbraHideInGal') === 'TRUE',
		zimbraNotes: findAttributeContent(attributes, 'zimbraNotes') || '',
		description: findAttributeContent(attributes, 'description') || '',
		sendShareMessageToNewMembers:
			findAttributeContent(attributes, 'zimbraDistributionListSendShareMessageToNewMembers') ===
			'TRUE',
		aliases,
		createTimestamp: findAttributeContent(attributes, 'zimbraCreateTimestamp') || '',
		mailStatusEnabled: findAttributeContent(attributes, 'zimbraMailStatus') === 'enabled',
		memberURL: findAttributeContent(attributes, 'memberURL'),
		isACLGroup: findAttributeContent(attributes, 'zimbraIsACLGroup') === 'TRUE'
	};
}

export function parseDistributionListMembership(
	response: { dl?: Array<{ id?: string; name?: string }> } | undefined
): Array<DistributionListMemberOf> {
	const members = response?.dl;
	if (!members || members.length === 0) {
		return [];
	}
	return members.map((item) => ({
		id: item?.id ?? '',
		name: item?.name ?? ''
	}));
}

export function parseDistributionListGrants(
	response: { grant?: Array<{ right?: Array<{ _content?: string }>; grantee?: Array<SoapGrantee> }> } | undefined,
	listId: string | undefined
): DistributionListGrants {
	const emails: Array<{ id: string; name: string }> = [];
	const owners: Array<{ id: string; name: string }> = [];
	const sendAcl: Array<{ id: string; name: string; sendAcl: string }> = [];
	let grantType = PUB;

	const grant = response?.grant;
	if (grant && Array.isArray(grant) && grant.length > 0) {
		const sendToListItems = grant.filter((item) => item?.right?.[0]?._content === 'sendToDistList');
		const ownDistListItems = grant.filter((item) => item?.right?.[0]?._content === 'ownDistList');
		const sendAsDistListItems = grant.filter(
			(item) => item?.right?.[0]?._content === 'sendAsDistList'
		);
		const sendOnBehalfOfDistListItems = grant.filter(
			(item) => item?.right?.[0]?._content === 'sendOnBehalfOfDistList'
		);

		if (sendToListItems && sendToListItems.length > 0) {
			const type = sendToListItems[0]?.grantee?.[0]?.type;
			const sameGranteeAsList = sendToListItems.filter(
				(item) =>
					item?.grantee?.[0]?.type === type && item?.grantee?.[0]?.id === listId
			);
			if (
				(type === GRP || type === DL || type === USR || type === EDOM || type === GST) &&
				sameGranteeAsList.length === 0
			) {
				grantType = EMAIL;
			} else if (type === GRP && sameGranteeAsList.length === 1) {
				grantType = GRP;
			} else if (type === ALL) {
				grantType = ALL;
			} else {
				// probably this option is not possible, but just in case set it to PUB
				grantType = PUB;
			}
		} else {
			grantType = PUB;
		}

		ownDistListItems.forEach((grantItem) => {
			if (grantItem?.right && Array.isArray(grantItem?.right)) {
				owners.push({
					id: grantItem?.grantee?.[0]?.id ?? '',
					name: grantItem?.grantee?.[0]?.name ?? ''
				});
			}
		});

		sendAsDistListItems.forEach((grantItem) => {
			if (grantItem?.right && Array.isArray(grantItem?.right)) {
				sendAcl.push({
					id: grantItem?.grantee?.[0]?.id ?? '',
					name: grantItem?.grantee?.[0]?.name ?? '',
					sendAcl: 'sendAsDistList'
				});
			}
		});

		sendOnBehalfOfDistListItems.forEach((grantItem) => {
			if (grantItem?.right && Array.isArray(grantItem?.right)) {
				sendAcl.push({
					id: grantItem?.grantee?.[0]?.id ?? '',
					name: grantItem?.grantee?.[0]?.name ?? '',
					sendAcl: 'sendOnBehalfOfDistList'
				});
			}
		});

		sendToListItems.forEach((grantItem) => {
			if (
				grantItem?.right &&
				Array.isArray(grantItem?.right) &&
				grantItem?.grantee?.[0]?.id !== listId &&
				grantItem?.grantee?.[0]?.type !== ALL
			) {
				emails.push({
					id: grantItem?.grantee?.[0]?.id ?? '',
					name: grantItem?.grantee?.[0]?.name ?? ''
				});
			}
		});
	}

	return { grantType, grantEmails: emails, owners, sendAs: sendAcl };
}
