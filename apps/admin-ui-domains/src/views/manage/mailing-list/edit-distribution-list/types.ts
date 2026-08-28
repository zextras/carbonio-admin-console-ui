/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type EditDistributionListFormValues = {
	displayName: string;
	distributionName: string;
	zimbraNotes: string;
	description: string;
	zimbraMailStatusValue: string; // 'TRUE' | 'FALSE' — value, not the option object
	zimbraHideInGal: boolean;
	sendShareMessageToNewMembers: boolean;
	memberURL: string;
	aliases: Array<{ label: string }>;
	dlm: Array<string>;
	dlMembershipList: Array<{ id: string; name: string }>; // member-of lists
	ownersList: Array<{ id: string; name: string }>;
	ownerOfList: Array<{ id: string }>; // dynamic owners (kept for parity with the save builder)
	sendEmails: Array<{ id: string; name: string; sendAcl: string }>;
	grantEmails: Array<{ id?: string; name?: string } | string>;
	grantTypeValue: string; // pub | grp | all | email
};

 
export type EditDistributionListFormApi = ReactFormExtendedApi<
	EditDistributionListFormValues,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>;
