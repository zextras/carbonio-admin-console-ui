/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PUB, TRUE_FALSE } from '../../../../constants';
import type {
	DistributionListDetail,
	DistributionListGrants,
	DistributionListMemberOf
} from './parse-distribution-list-detail';
import type { EditDistributionListFormValues } from './types';

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
		selectedMailingList?.a?.find((attribute: any) => attribute?.n === 'displayName')?._content ??
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
