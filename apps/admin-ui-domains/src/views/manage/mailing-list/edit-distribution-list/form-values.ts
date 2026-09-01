/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isEqual } from 'lodash-es';

import { PUB, TRUE_FALSE } from '../../../../constants';
import {
	buildSaveOperations,
	type CurrentDetailSnapshot,
	type PreviousDetailSnapshot
} from './build-save-operations';
import type {
	DistributionListDetail,
	DistributionListGrants,
	DistributionListMemberOf
} from './parse-distribution-list-detail';
import type { EditDistributionListFormValues } from './types';

const IMMEDIATE_SAVE_FIELD_KEYS = ['dlm', 'ownersList', 'sendEmails'] as const;

export function omitImmediateSaveFields(
	values: EditDistributionListFormValues,
): Omit<EditDistributionListFormValues, (typeof IMMEDIATE_SAVE_FIELD_KEYS)[number]> {
	const { dlm, ownersList, sendEmails, ...deferred } = values;
	return deferred;
}

export function isDeferredSaveDirty(
	values: EditDistributionListFormValues | undefined,
	defaults: EditDistributionListFormValues | undefined,
): boolean {
	if (!values || !defaults) {
		return false;
	}
	return !isEqual(omitImmediateSaveFields(values), omitImmediateSaveFields(defaults));
}

/**
 * Maps the parsed query data (detail / membership / grants) plus the selected
 * list into the form's default values. Pure: same inputs → same output, so it
 * doubles as the source for the save builder's "previous" snapshot.
 */
export function mapToFormValues(
	detail: DistributionListDetail | undefined,
	membership: Array<DistributionListMemberOf>,
	grants: DistributionListGrants | undefined,
	selectedMailingList: any
): EditDistributionListFormValues {
	const displayName =
		detail?.displayName ||
		selectedMailingList?.a?.find((attribute: any) => attribute?.n === 'displayName')?._content ||
		'';

	return {
		displayName,
		distributionName: selectedMailingList?.name ?? '',
		zimbraNotes: detail?.zimbraNotes ?? '',
		description: detail?.description ?? '',
		zimbraMailStatusValue: detail?.mailStatusEnabled ? TRUE_FALSE.TRUE : TRUE_FALSE.FALSE,
		zimbraHideInGal: detail?.zimbraHideInGal ?? false,
		sendShareMessageToNewMembers: detail?.sendShareMessageToNewMembers ?? false,
		memberURL: detail?.memberURL ?? '',
		aliases: detail?.aliases ?? [],
		dlm: detail?.dlm ?? [],
		dlMembershipList: membership ?? [],
		ownersList: grants?.owners ?? [],
		ownerOfList: [],
		sendEmails: grants?.sendAs ?? [],
		grantEmails: grants?.grantEmails ?? [],
		grantTypeValue: grants?.grantType ?? PUB
	};
}

/** Maps form values to the save builder's "previous" snapshot (the loaded defaults). */
export function toPreviousSnapshot(values: EditDistributionListFormValues): PreviousDetailSnapshot {
	return {
		displayName: values.displayName,
		distributionName: values.distributionName,
		zimbraNotes: values.zimbraNotes,
		description: values.description,
		zimbraMailStatus: { value: values.zimbraMailStatusValue },
		zimbraHideInGal: values.zimbraHideInGal,
		zimbraDistributionListSendShareMessageToNewMembers: values.sendShareMessageToNewMembers,
		memberURL: values.memberURL,
		dlMembershipList: values.dlMembershipList,
		ownerOfList: values.ownerOfList,
		grantEmails: values.grantEmails,
		grantType: { value: values.grantTypeValue }
	};
}

/** Maps form values to the save builder's "current" snapshot. */
export function toCurrentSnapshot(
	values: EditDistributionListFormValues,
	defaults: EditDistributionListFormValues,
	context: { dynamic: boolean; isACLGroup: boolean; listId: string; listName: string }
): CurrentDetailSnapshot {
	return {
		displayName: values.displayName,
		distributionName: values.distributionName,
		zimbraNotes: values.zimbraNotes,
		description: values.description,
		zimbraMailStatusValue: values.zimbraMailStatusValue,
		zimbraHideInGal: values.zimbraHideInGal,
		sendShareMessageToNewMembers: values.sendShareMessageToNewMembers,
		memberURL: values.memberURL,
		dynamic: context.dynamic,
		isACLGroup: context.isACLGroup,
		listId: context.listId,
		listName: context.listName,
		defaultAliases: defaults.aliases,
		aliases: values.aliases,
		dlMembershipList: values.dlMembershipList,
		ownerOfList: values.ownerOfList,
		grantEmails: values.grantEmails,
		grantTypeValue: values.grantTypeValue
	};
}

/**
 * Convenience: builds the save operations diffing current form values against
 * the loaded defaults.
 */
export function buildFormSaveOperations(
	values: EditDistributionListFormValues,
	defaults: EditDistributionListFormValues,
	context: { dynamic: boolean; isACLGroup: boolean; listId: string; listName: string }
): Array<ReturnType<typeof buildSaveOperations>[number]> {
	return buildSaveOperations(toPreviousSnapshot(defaults), toCurrentSnapshot(values, defaults, context));
}
