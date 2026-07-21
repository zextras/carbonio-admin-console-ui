/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import type { ComponentType } from 'react';

export type AdvancedVolumeFormValues = {
	volumeName: string;
	volumeMain: number;
	isCurrent: boolean;
	volumeAllocation: string;
	bucketName: string;
	unusedBucketType: string;
	tieringSupported: boolean;
	bucketId: string;
	prefix: string;
	centralized: boolean;
	useInfrequentAccess: boolean;
	infrequentAccessThreshold: string;
	useIntelligentTiering: boolean;
	path: string;
	isCompression: boolean;
	compressionThreshold: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdvancedVolumeFormApi = ReactFormExtendedApi<
	AdvancedVolumeFormValues,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any
>;

/**
 * Props injected by HorizontalWizard into each step's CancelButton / PrevButton
 * / NextButton render functions. Reconstructed from the runtime contract since
 * HorizontalWizard is typed as ComponentType<any> with no exported prop types.
 */
export type WizardButtonRenderProps = {
	readonly label?: string;
	readonly onClick: () => void;
	readonly setCompleteLoading?: (value: boolean) => void;
	readonly completeLoading?: boolean;
	readonly disabled?: boolean;
	readonly toggleNextBtn?: boolean;
};

/**
 * Props injected by HorizontalWizard into each step's `view` component.
 */
export type WizardViewProps = {
	step: WizardStep;
	isActive: boolean;
	getData: () => unknown;
	onSelection: (step: string) => void;
	goToStep: (step: string) => void;
	title: string;
	onComplete: (
		data: unknown,
		setCompleteLoading: (value: boolean) => void,
		resetWizard: () => void,
	) => void;
	setCompleteLoading: (value: boolean) => void;
	externalData: unknown;
	setToggleNextBtn: (value: boolean) => void;
	setToggleWizardSection: (value: boolean) => void;
};

/**
 * Shape of a single entry in HorizontalWizard's `steps` array.
 *
 * `view` is typed as `ComponentType<any>` because HorizontalWizard itself is
 * `ComponentType<any>` with no exported prop types, and the underlying view components
 * each declare only the subset of WizardViewProps they consume. The
 * WizardViewProps type above documents the runtime contract.
 */
export type WizardStep = {
	name: string;
	label: string;
	icon: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	view: ComponentType<any>;
	canGoNext: () => boolean;
	clickDisabled?: boolean;
	CancelButton?: ComponentType<WizardButtonRenderProps>;
	PrevButton?: ComponentType<WizardButtonRenderProps>;
	NextButton?: ComponentType<WizardButtonRenderProps>;
};
