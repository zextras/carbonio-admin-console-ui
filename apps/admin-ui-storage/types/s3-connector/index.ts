/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { S3ConnectorVolume } from '../volume';

/**
 * S3ConnectorVolume with storeType guaranteed to exist (used in edit views).
 */
export type S3ConnectorDetail = S3ConnectorVolume & {
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
 * Props for the Connection component (used inside new-s3-connector wizard and standalone).
 */
export type ConnectionProps = {
    isActive: boolean;
    onSelection: (data: ConnectionStepData, replace?: boolean) => void;
    externalData: string | undefined;
    setCompleteLoading: (loading: boolean) => void;
};

/**
 * Props for the NewS3Connector wizard wrapper component.
 */
export type NewS3ConnectorProps = {
    setToggleWizardSection: (toggle: boolean) => void;
    setDetailsConnector: (show: boolean) => void;
    connectorType: string | undefined;
    setConnectionData: (data: ConnectionStepData | undefined) => void;
};

/**
 * Props for EditS3ConnectorDetailsPanel.
 */
export type EditS3ConnectorDetailsPanelProps = {
    setShowEditDetailView: (show: boolean) => void;
    title: string;
    setConnectorDeleteName: (connector: S3ConnectorDetail) => void;
    connectorDetail: S3ConnectorDetail;
    setOpen: (open: boolean) => void;
    getConnectorListType: () => void;
    setSelectedRow: (row: S3ConnectorDetail) => void;
    setToggleForGetAPICall: (toggle: boolean) => void;
    toggleForGetAPICall: boolean;
};

/**
 * State shape for the modified connector details sent to the update API.
 */
export type ModifiedS3ConnectorDetails = {
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
export type S3ConnectorPreviousDetail = {
    bucketName?: string;
    bucketLabel?: string;
    regionData?: SelectItem | string | false;
    accessKeyData?: string;
    secretKey?: string;
    url?: string;
    bucketType?: SelectItem;
};
