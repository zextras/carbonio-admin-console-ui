/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { RenameDistributionListRequest, RenameDistributionListResponse } from '../../types';

export const renameDistributionList = async (dlId: string, newName?: string): Promise<RenameDistributionListResponse> => {
	const request: RenameDistributionListRequest = {
		_jsns: 'urn:zimbraAdmin',
		id: dlId,
		newName
	};

	return soapFetch<RenameDistributionListRequest, RenameDistributionListResponse>(`RenameDistributionList`, {
		...request
	});
};
