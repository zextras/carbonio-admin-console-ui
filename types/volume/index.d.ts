/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Volume = {
	availableSpace?: number;
	bucketConfigurationId?: string;
	centralized?: boolean;
	compressed?: boolean;
	id?: number;
	infrequentAccessThreshold?: number;
	isCurrent?: boolean;
	isDrivePrimary?: boolean;
	name?: string;
	path?: string;
	storeType?: string;
	threshold?: number;
	totalSpace?: number;
	useInfrequentAccess?: boolean;
	useIntelligentTiering?: boolean;
	volumePrefix?: string;
	volumeType?: string;
};

export type VolumeType =
	| {
			label?: string;
			value?: number | undefined;
	  }
	| undefined;

export type BucketVolume = {
	bucketName?: string;
	protocol?: string;
	storeType?: string;
	accessKey?: string;
	secret?: string;
	label?: string;
	uuid?: string;
	signatureVersion?: string;
	url?: string;
	'usage in powerstore volumes'?: string | Array<any>;
	'usage in external backup'?: string | Array<any>;
	notes?: string;
	region?: string;
};

export type Bucket = {
	label?: string;
	value?: string;
};
