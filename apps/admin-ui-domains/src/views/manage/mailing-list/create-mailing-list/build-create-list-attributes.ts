/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FALSE, TRUE } from '../../../../constants';

/** Shape of the wizard's `mailingListDetail` consumed by the create flow. */
export type CreateMailingListDetail = {
	prefixName: string;
	suffixName: string;
	description: string;
	dynamic: boolean;
	displayName: string;
	zimbraHideInGal: boolean;
	zimbraMailStatus: boolean;
	zimbraNotes: string;
	memberURL: string;
	members: Array<string>;
	zimbraDistributionListSendShareMessageToNewMembers: boolean;
	owners: Array<string>;
	ownerGrantEmailType: { value?: string } | undefined;
	ownerGrantEmails: Array<string>;
};

type SoapAttribute = { n: string; _content: string };

/**
 * Builds the SOAP attribute list for `CreateDistributionList`: the shared
 * basics, then the dynamic/static-specific attributes, with the description
 * always appended last.
 */
export function buildCreateListAttributes(
	detail: CreateMailingListDetail
): Array<SoapAttribute> {
	const attributes: Array<SoapAttribute> = [
		{ n: 'displayName', _content: detail.displayName },
		{ n: 'zimbraNotes', _content: detail.zimbraNotes },
		{ n: 'zimbraHideInGal', _content: detail.zimbraHideInGal ? TRUE : FALSE },
		{ n: 'zimbraMailStatus', _content: detail.zimbraMailStatus ? 'enabled' : 'disabled' }
	];
	if (detail.dynamic) {
		attributes.push(
			{ n: 'zimbraIsACLGroup', _content: detail.memberURL === '' ? TRUE : FALSE },
			{ n: 'memberURL', _content: detail.memberURL }
		);
	} else {
		attributes.push({
			n: 'zimbraDistributionListSendShareMessageToNewMembers',
			_content: detail.zimbraDistributionListSendShareMessageToNewMembers ? TRUE : FALSE
		});
	}
	attributes.push({ n: 'description', _content: detail.description });
	return attributes;
}
