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

/**
 * Normalized volume state used in ModifyVolume component.
 */
export type VolumeDetailState = {
	name: string;
	id: number;
	type: number;
	compressBlobs: boolean;
	isCurrent: boolean;
	rootpath: string;
	compressionThreshold: string;
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

interface VolumeDetails {
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
}

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

export type CreateVolumeRequest = {
	compressBlobs?: string | boolean;
	compressionThreshold?: string | number;
	isCurrent?: boolean | number;
	name?: string;
	rootpath?: string;
	type?: number;
};

export type CreateVolumeResponse = {
	volume?: Array<Volume>;
	_jsns?: string;
};

export type SetCurrentVolumeRequest = {
	_jsns: string;
	id: number | string;
	type?: number;
};

/**
 * Allocation type used in dropdowns (e.g. "Local Block Device", "Object Storage")
 */
export type VolumeAllocationItem = {
	label: string;
	value: number;
};

/**
 * Bucket type / region dropdown item
 */
export type SelectItem = {
	label: string;
	value: string;
};

/**
 * Wizard state for creating a new local volume (CE mode)
 */
export type VolumeWizardDetail = {
	id?: string | number;
	volumeName?: string;
	volumeMain?: number | string;
	path?: string;
	isCurrent?: boolean;
	isCompression?: boolean;
	compressionThreshold?: string | number;
	volumeAllocation?: number | string;
};

/**
 * Wizard state for creating a new advanced volume (ZxPowerstore mode)
 */
export type AdvancedVolumeWizardDetail = VolumeWizardDetail & {
	useInfrequentAccess?: boolean;
	useIntelligentTiering?: boolean;
	centralized?: boolean;
	infrequentAccessThreshold?: number | string;
	volumePrefix?: string;
	bucketConfigurationId?: string;
	bucketName?: string;
	unusedBucketType?: string;
	bucketId?: string;
	prefix?: string;
	volumeType?: string;
	storeType?: string;
};

/**
 * Props passed to wizard step button components (CancelButton, PrevButton, NextButton).
 * The wizard injects ButtonProps plus extra fields like toggleNextBtn, completeLoading, etc.
 */
export type WizardButtonProps = Partial<import('react').ButtonHTMLAttributes<HTMLButtonElement>> & Record<string, unknown>;

/**
 * Props for the WizardInSection wrapper component.
 */
export type WizardInSectionProps = {
	wizard: React.ReactNode;
	wizardFooter: React.ReactNode;
	setToggleWizardSection: (v: boolean) => void;
	externalData: string;
};

/**
 * Props for CreateMailstoresVolume (advanced wizard)
 */
export type CreateMailstoresVolumeProps = {
	setToggleWizardExternal: (v: boolean) => void;
	setToggleWizardLocal: (v: boolean) => void;
	volName: string;
	CreateAdvancedRequest: (params: Record<string, unknown>) => void;
};

/**
 * Props for NewVolume (CE wizard)
 */
export type NewVolumeProps = {
	setToggleWizardLocal: (v: boolean) => void;
	setToggleWizardExternal: (v: boolean) => void;
	volName: string;
	CreateVolumeRequest: (attr: Partial<Volume>) => void;
	isLoading: boolean;
};

/**
 * Props for MailstoresCreate step
 */
export type MailstoresCreateProps = {
	onSelection: (data: Record<string, unknown>, flag: boolean) => void;
	externalData: string;
	setCompleteLoading: (v: boolean) => void;
};

/**
 * Props for IndexerVolumeTable
 */
export type IndexerVolumeTableProps = {
	volumes: Array<Volume>;
	selectedRows: Array<string>;
	onSelectionChange: (selected: Array<string>) => void;
	headers: Array<{ id: string; label: string; width: string; bold?: boolean }>;
	onClick: (index: number) => void;
	isAdvanced: boolean;
};

/**
 * Props for DeleteVolumeModel
 */
export type DeleteVolumeModelProps = {
	open: boolean;
	closeHandler: () => void;
	deleteHandler: (data: Volume | undefined) => void;
	volumeDetail: Volume | undefined;
};

/**
 * Props for ModifyVolume
 */
export type ModifyVolumeProps = {
	volumeId: number | string;
	setmodifyVolumeToggle: (v: boolean) => void;
	getAllVolumesRequest: () => void;
	selectedServerId: string;
	volumeList: {
		primaries: Array<Volume>;
		indexes: Array<Volume>;
		secondaries: Array<Volume>;
	};
	setOpen: (v: boolean) => void;
};

/**
 * Props for AdvancedMailstoresConfig step
 */
export type AdvancedMailstoresConfigProps = {
	onSelection: (data: Record<string, unknown>, flag: boolean) => void;
	externalData: string;
	setCompleteLoading: (v: boolean) => void;
};

/**
 * Props for AdvancedMailstoresDefinition step
 */
export type AdvancedMailstoresDefinitionProps = {
	externalData: string;
};

/**
 * Props for AdvancedMailstoresCreate step
 */
export type AdvancedMailstoresCreateProps = {
	setCompleteLoading: (v: boolean) => void;
};
