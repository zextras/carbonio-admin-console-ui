/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { RenameCalendarResourceRequest, RenameCalendarResourceResponse } from '../../types';

export const renameCalendarResource = async (
	resourceId: string,
	newName?: string
): Promise<RenameCalendarResourceResponse> => {
	const request: RenameCalendarResourceRequest = {
		_jsns: 'urn:zimbraAdmin',
		id: resourceId,
		newName
	};

	return soapFetch<RenameCalendarResourceRequest, RenameCalendarResourceResponse>(`RenameCalendarResource`, {
		...request
	});
};
