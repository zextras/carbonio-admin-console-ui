/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Volume } from '../volume';

/**
 * Generic wrapper for responses from postSoapFetchRequest / fetchSoap
 * when calling the Zimbra SOAP admin endpoint via ZxPowerstore/ZxCore modules.
 */
export type ZextrasRawResponse = {
    Body: {
        response: {
            content: string;
        };
    };
};

/**
 * Parsed content from a ZxPowerstore response.
 * The `response` field is keyed by server name.
 */
export type ZxPowerstoreResponse<T = unknown> = {
    response: Record<string, ZxPowerstoreServerResult<T>>;
};

export type ZxPowerstoreServerResult<T = unknown> = {
    ok: boolean;
    error?: ZxPowerstoreError;
    exception?: { message: string };
    response?: T;
};

export type ZxPowerstoreError = {
    code?: string;
    message?: string;
};

/**
 * GetAllVolumes (advanced mode, via ZxPowerstore)
 */
export type GetAllVolumesAdvancedResult = {
    primaries: Array<Volume>;
    secondaries: Array<Volume>;
    indexes: Array<Volume>;
};

/**
 * GetAllVolumes (CE mode, via soapFetch)
 */
export type GetAllVolumesCEResponse = {
    volume: Array<Volume>;
    _jsns: string;
};

/**
 * HSM policy as returned by getHSMPolicy
 */
export type HsmPolicyFromServer = {
    hsmQuery: string;
    hsmType: Array<number>;
};

/**
 * getHSMPolicy parsed result
 */
export type GetHSMPolicyResult = {
    policies: Array<HsmPolicyFromServer>;
};

/**
 * Bucket list response (from doCreateBucket / listBuckets)
 */
export type BucketOperationResponse = {
    ok: boolean;
    response: {
        message?: string;
        values?: Array<Record<string, string>>;
    };
};

/**
 * Response from setCoreAttributes (external SOAP)
 */
export type SetCoreAttributesResponse = {
    errors?: Array<{ error: string }>;
    error?: string;
};

/**
 * getAllServers (external SOAP)
 */
export type GetAllServersResponse = {
    servers: Array<Record<string, Record<string, ZxPowerstoreServerEntry>>>;
};

export type ZxPowerstoreServerEntry = {
    name: string;
    ZxPowerstore?: {
        attributes?: ZxPowerstoreAttributes;
    };
};

export type ZxPowerstoreAttributes = {
    powerstoreMoveScheduler?: {
        value: {
            'cron-pattern'?: string;
            'cron-enabled'?: boolean;
        };
    };
    ZxPowerstore_SpaceThreshold?: {
        value: number;
    };
    deduplicateAfterScheduledMoveBlobs?: {
        value: boolean;
    };
    ZxPowerstore_MoveSchedulingEnabled?: {
        value: boolean;
    };
};

/**
 * Request body for setCoreAttributes
 */
export type SetCoreAttributesRequestBody = Record<
    string,
    {
        value: unknown;
        objectName: string;
        configType: string;
    }
>;

/**
 * SOAP request body for ZxPowerstore/ZxCore actions
 */
export type ZextrasRequestBody = {
    _jsns: string;
    module?: string;
    action?: string;
    targetServers?: string;
    [key: string]: unknown;
};
