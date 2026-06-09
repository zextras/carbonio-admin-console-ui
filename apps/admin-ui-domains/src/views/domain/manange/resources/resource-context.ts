/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext, Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DropdownItem = any;

export type ResourceDetail = {
	name: string;
	changeNameBool: boolean;
	domain: string;
	description: string;
	password: string;
	repeatPassword: string;
	displayName: string;
	zimbraCOSId: DropdownItem;
	zimbraAccountStatus: DropdownItem;
	zimbraCalResType: DropdownItem;
	zimbraCalResAutoDeclineRecurring: DropdownItem;
	zimbraCalResMaxNumConflictsAllowed: string;
	zimbraCalResMaxPercentConflictsAllowed: string;
	zimbraPrefCalendarAutoAcceptSignatureId: DropdownItem;
	zimbraPrefCalendarAutoDeclineSignatureId: DropdownItem;
	zimbraPrefCalendarAutoDenySignatureId: DropdownItem;
	sendInviteList: Array<DropdownItem>;
	signaturelist: Array<DropdownItem>;
	schedulePolicyType: DropdownItem;
	signatureItems: Array<DropdownItem>;
	zimbraNotes: string;
};

type ResourceContextValue = {
	resourceDetail: ResourceDetail;
	setResourceDetail: Dispatch<SetStateAction<ResourceDetail>>;
};
export const ResourceContext = createContext({} as ResourceContextValue);
