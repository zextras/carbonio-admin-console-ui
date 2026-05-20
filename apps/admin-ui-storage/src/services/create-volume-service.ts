/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { CreateVolumeRequest, CreateVolumeResponse } from '../../types';

type CreateVolumeBody = {
	_jsns: string;
	volume?: {
		compressBlobs: CreateVolumeRequest['compressBlobs'];
		compressionThreshold: CreateVolumeRequest['compressionThreshold'];
		isCurrent: boolean;
		name: CreateVolumeRequest['name'];
		rootpath: CreateVolumeRequest['rootpath'];
		type: CreateVolumeRequest['type'];
	};
};

export const createVoume = async (attribute?: CreateVolumeRequest): Promise<CreateVolumeResponse> => {
	const request: CreateVolumeBody = {
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
