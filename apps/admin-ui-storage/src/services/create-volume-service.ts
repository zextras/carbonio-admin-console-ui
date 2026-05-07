/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const createVoume = async (attribute?: Record<string, unknown>): Promise<unknown> => {
	const request: {
		_jsns: string;
		volume?: {
			compressBlobs: unknown;
			compressionThreshold: unknown;
			isCurrent: boolean;
			name: unknown;
			rootpath: unknown;
			type: unknown;
		};
	} = {
		_jsns: 'urn:zimbraAdmin'
	};
	if (attribute) {
		request.volume = {
			compressBlobs: attribute?.compressBlobs,
			compressionThreshold: attribute?.compressionThreshold,
			isCurrent: attribute?.isCurrent === 1,
			name: attribute?.name,
			rootpath: attribute?.rootpath,
			type: attribute?.type
		};
	}
	return soapFetch(`CreateVolume`, {
		...request
	});
};
