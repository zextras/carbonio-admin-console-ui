/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Volume = {
	id?: number;
	name?: string;
	rootpath?: string;
	type?: number;
	compressBlobs?: string;
	compressionThreshold?: string;
	mgbits?: number;
	mbits?: number;
	fgbits?: number;
	fbits?: number;
	isCurrent?: boolean | number;
	availableSpace?: number;
	bucketConfigurationId?: string;
	centralized?: boolean;
	compressed?: boolean;
	infrequentAccessThreshold?: number;
	isDrivePrimary?: boolean;
	path?: string;
	storeType?: string;
	threshold?: number;
	totalSpace?: number;
	useInfrequentAccess?: boolean;
	useIntelligentTiering?: boolean;
	volumePrefix?: string;
	volumeType?: string;
	volumeName?: string;
	serverName?: string;
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
	'usage in powerstore volumes'?: string | Array<string>;
	'usage in external backup'?: string | Array<string>;
	notes?: string;
	region?: string;
};

export type Bucket = {
	label?: string;
	value?: string;
};

export type VolumeDetails = {
	id: number;
	name: string;
	rootpath: string;
	type: number;
	compressBlobs: boolean;
	compressionThreshold: number;
	mgbits: number;
	mbits: number;
	fgbits: number;
	fbits: number;
	isCurrent: boolean;
};

export type VolumeItem = {
	id: string;
	name?: string;
	type?: number;
	isCurrent?: boolean;
};

export type VolumeDetailObj = {
	id: string;
	volumeName: string;
	volumeMain: number;
	path: string;
	isCurrent: boolean;
	isCompression: boolean;
	compressionThreshold: number | string;
	volumeAllocation: number;
};

export type AdvancedVolumeDetailObj = {
	volumeName: string;
	volumeMain: number;
	isCurrent: boolean;
	volumeAllocation: string;
	bucketName: string;
	unusedBucketType: string;
	bucketId: string;
	prefix: string;
	centralized: boolean;
	useInfrequentAccess: boolean;
	infrequentAccessThreshold: string;
	useIntelligentTiering: boolean;
};

export type RegionOption = {
	label: string;
	value: string;
};

export type WizardButtonProps = {
	completeLoading?: boolean;
	disabled?: boolean;
	toggleNextBtn?: boolean;
	[key: string]: unknown;
};

export type typeVolApiProperty = {
	_jsns: string;
	module: string;
	action: string;
	targetServers: string;
	volumeType: string;
	storeType?: string;
	isCurrent?: boolean | number;
	currentVolumeName?: string;
};

export type TestConnectionObjectType = {
	_jsns: string;
	module?: string;
	action?: string;
	targetServers?: string; // This property is optional
	bucketId?: string;
	storeType?: string;
	bucketName?: string;
	label?: string;
	notes?: string;
	accessKey?: string;
	secret?: string;
	region?: string;
	signatureVersion?: string;
	protocol?: string;
	url?: string;
	prefix?: string;
	targetServer?: string;
	bucketConfigurationId?: string;
};
