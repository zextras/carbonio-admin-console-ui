/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BucketVolume } from '../volume';

/**
 * BucketVolume with storeType guaranteed to exist (used in edit views).
 */
export type BucketDetail = BucketVolume & {
    storeType: string;
    prefix?: string;
};

/**
 * Select option item used for bucket type and region dropdowns.
 */
export type SelectItem = {
    value: string;
    label: string;
};

/**
 * Data passed from the Connection wizard step upon completion.
 */
export type ConnectionStepData = {
    uuid?: string;
    storeType?: string;
    region?: string;
    bucketName?: string;
    accessKey?: string;
    secret?: string;
    url?: string;
    label?: string;
    notes?: string;
    prefix?: string;
};

/**
 * Props for the Connection component (used inside new-bucket wizard and standalone).
 */
export type ConnectionProps = {
    isActive: boolean;
    onSelection: (data: ConnectionStepData, replace?: boolean) => void;
    externalData: string | undefined;
    setCompleteLoading: (loading: boolean) => void;
};

/**
 * Props for the NewBucket wizard wrapper component.
 */
export type NewBucketProps = {
    setToggleWizardSection: (toggle: boolean) => void;
    setDetailsBucket: (show: boolean) => void;
    bucketType: string | undefined;
    setConnectionData: (data: ConnectionStepData | undefined) => void;
};

/**
 * Props for EditBucketDetailsPanel.
 */
export type EditBucketDetailsPanelProps = {
    setShowEditDetailView: (show: boolean) => void;
    title: string;
    setBucketDeleteName: (bucket: BucketDetail) => void;
    bucketDetail: BucketDetail;
    setOpen: (open: boolean) => void;
    getBucketListType: () => void;
    setSelectedRow: (row: BucketDetail) => void;
    setToggleForGetAPICall: (toggle: boolean) => void;
    toggleForGetAPICall: boolean;
};

/**
 * State shape for the modified bucket details sent to the update API.
 */
export type ModifiedBucketDetails = {
    _jsns: string;
    module: string;
    action: string;
    bucketConfigurationId?: string;
    storeType?: string;
    bucketName?: string;
    label?: string;
    notes?: string;
    accessKey?: string;
    secret?: string;
    region?: string;
    url?: string;
};

/**
 * Previous detail snapshot used for dirty tracking / undo in edit panel.
 */
export type BucketPreviousDetail = {
    bucketName?: string;
    bucketLabel?: string;
    regionData?: SelectItem | string | false;
    accessKeyData?: string;
    secretKey?: string;
    url?: string;
    bucketType?: SelectItem;
};
