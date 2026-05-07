/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type VolumeItem } from '../volume';

export type HsmPolicy = {
    hsmQuery: string;
    hsmType: Array<number>;
};

export type HsmDetailObj = {
    allVolumes: Array<VolumeItem>;
    isAllEnabled: boolean;
    isMessageEnabled: boolean;
    isEventEnabled: boolean;
    isContactEnabled: boolean;
    isDocumentEnabled: boolean;
    policyCriteria: Array<PolicyCriteriaItem>;
    sourceVolume: Array<VolumeItem>;
    destinationVolume: Array<VolumeItem>;
};

export type EditHsmDetailObj = HsmDetailObj & {
    isDataLoaded: boolean;
    isVolumeLoaded: boolean;
};

export type PolicyCriteriaItem = {
    option: string;
    dateScale: string;
    scale: string;
};

export type SelectOption = {
    label: string;
    value: string;
};

export type HsmOldValues = {
    isZxPowerstoreMoveSchedulingEnabled?: boolean;
    powerstoreMoveSchedulerValue?: string;
    powerstoreSpaceThreshold?: number;
    deduplicateAfterScheduledMoveBlobs?: boolean;
};
