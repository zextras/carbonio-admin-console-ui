/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { HsmPolicyDetail, PolicyCriteriaItem, VolumeItem } from '../../src/views/s3-connectors/hsm/hsm-policy-detail';
import type { Volume } from '../volume';

export type { HsmPolicyDetail, PolicyCriteriaItem, VolumeItem };

/**
 * HSM settings values (old/saved values for dirty tracking)
 */
export type HsmSettingsValues = {
    isZxPowerstoreMoveSchedulingEnabled: boolean;
    powerstoreMoveSchedulerValue: string;
    powerstoreSpaceThreshold: number;
    deduplicateAfterScheduledMoveBlobs: boolean;
};

/**
 * HSM policy detail object used in both Create and Edit policy views.
 * Extends HsmPolicyDetail with allVolumes and optional loaded flags.
 * Overrides sourceVolume/destinationVolume to accept full Volume objects.
 */
export type HsmPolicyEditDetail = Omit<HsmPolicyDetail, 'sourceVolume' | 'destinationVolume'> & {
    allVolumes: Array<Volume>;
    sourceVolume: Array<Volume>;
    destinationVolume: Array<Volume>;
    isDataLoaded?: boolean;
    isVolumeLoaded?: boolean;
};

/**
 * Tab bar item used in Edit HSM Policy
 */
export type TabBarItem = {
    id: string;
    label: string;
    CustomComponent: React.FC<TabBarItemProps>;
    icon: string;
};

export type TabBarItemProps = {
    item: TabBarItem;
    index: number;
    selected: boolean;
    onClick: () => void;
};

/**
 * HSM policy as returned by the server (getHSMPolicy).
 */
export type HsmPolicyFromServer = {
    hsmQuery: string;
    hsmType: Array<number>;
};

/**
 * Props for EditHsmPolicy component.
 */
export type EditHsmPolicyProps = {
    readonly setShowEditHsmPolicyView: (show: boolean) => void;
    readonly policies: Array<HsmPolicyFromServer>;
    readonly selectedPolicies: string;
    readonly volumeList: Array<Volume>;
    readonly onEditSave: (detail: HsmPolicyEditDetail) => void;
    readonly isEditSaveInProgress: boolean;
};

/**
 * Props for CreateHsmPolicy component.
 */
export type CreateHsmPolicyProps = {
    readonly setShowCreateHsmPolicyView: (show: boolean) => void;
    readonly volumeList: Array<Volume>;
    readonly createHSMpolicy: (detail: HsmPolicyEditDetail, isEditSave?: boolean) => void;
    readonly runCustomHSMpolicy: (detail: HsmPolicyEditDetail) => void;
};

/**
 * Props for DeleteHsmPolicy component.
 */
export type DeleteHsmPolicyProps = {
    readonly showDeletePolicyView: boolean;
    readonly setShowDeletePolicyView: (show: boolean) => void;
    readonly selectedPolicies: string;
    readonly onDeletePolicy: (isEditSave?: boolean) => void;
    readonly isRequestInProgress: boolean;
    readonly policies: Array<HsmPolicyFromServer>;
};
