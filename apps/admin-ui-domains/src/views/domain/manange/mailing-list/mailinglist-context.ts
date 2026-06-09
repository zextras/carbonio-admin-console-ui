/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DropdownItem = any;

export type MailingListDetail = {
	name: string;
	dynamic: boolean;
	zimbraIsACLGroup: string;
	zimbraMailStatus: boolean;
	displayName: string;
	description: string;
	zimbraHideInGal: boolean;
	zimbraNotes: string;
	memberURL: string;
	members: Array<DropdownItem>;
	zimbraDistributionListSendShareMessageToNewMembers: boolean;
	owners: Array<DropdownItem>;
	prefixName: string;
	suffixName: string;
	ldapQueryMembers: Array<DropdownItem>;
	allOwnersList: Array<DropdownItem>;
	ownerGrantEmailType: DropdownItem;
	ownerGrantEmails: Array<DropdownItem>;
};

type MailingListContextValue = {
	mailingListDetail: MailingListDetail;
	setMailingListDetail: Dispatch<SetStateAction<MailingListDetail>>;
};
export const MailingListContext = createContext({} as MailingListContextValue);
