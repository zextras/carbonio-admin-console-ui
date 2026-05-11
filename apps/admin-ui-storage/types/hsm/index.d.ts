/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { HsmPolicyDetail, PolicyCriteriaItem, VolumeItem } from '../../src/views/bucket/hsm/hsm-policy-detail';
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
 */
export type HsmPolicyEditDetail = HsmPolicyDetail & {
    allVolumes: Array<Volume>;
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
