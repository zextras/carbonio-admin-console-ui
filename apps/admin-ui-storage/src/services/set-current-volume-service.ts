/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const setCurrentVolumeRequest = async (id: number, type?: number): Promise<unknown> => {
	const request = {
		_jsns: 'urn:zimbraAdmin',
		id,
		type
	};

	return soapFetch(`SetCurrentVolume`, {
		...request
	});
};
