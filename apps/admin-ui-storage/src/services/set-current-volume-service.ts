/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

type SetCurrentVolumeBody = {
	_jsns: string;
	id: number | string;
	type?: number;
};

export const setCurrentVolumeRequest = async (
	id: number | string,
	type?: number
): Promise<unknown> => {
	const request: SetCurrentVolumeBody = {
		_jsns: 'urn:zimbraAdmin',
		id,
		type
	};

	return soapFetch(`SetCurrentVolume`, {
		...request
	});
};
