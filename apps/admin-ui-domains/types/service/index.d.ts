/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../attribute';

// ============================================================
// Common SOAP types
// ============================================================

export type ZimbraNamespace =
    | 'urn:zimbraAdmin'
    | 'urn:zimbraAccount'
    | 'urn:zimbraMail';

export type SoapAttribute = {
    n: string;
    _content?: string;
};

/**
 * Common shape for SOAP entity references (by id or name)
 */
export type SoapEntitySelector = {
    by: string;
    _content: string;
};

/**
 * Common shape for entities returned by Zimbra Admin SOAP APIs
 */
export type SoapEntity = {
    id: string;
    name: string;
    a?: Array<Attribute>;
};

/**
 * Common paginated search response shape
 */
export type SearchDirectoryResponse<K extends string, T = SoapEntity> = {
    [key in K]?: Array<T>;
} & {
    more: boolean;
    searchTotal: number;
    _jsns: string;
};

/**
 * Common empty SOAP response for delete or void operations
 */
export type SoapEmptyResponse = Record<string, never>;

/**
 * Common error-or-success result pattern used in REST services
 */
export type ServiceResult<T extends Record<string, unknown> = Record<string, never>> =
    | ({ type: 'success' } & T)
    | { type: 'error'; error: string };

/**
 * Response shape from postSoapFetchRequest / zextras endpoints
 */
export type ZextrasRawResponse = {
    ok?: boolean | string;
    error?: string;
    Body?: {
        response?: {
            content?: string;
        };
        Fault?: {
            Reason?: {
                Text?: string;
            };
        };
        GetSignaturesResponse?: {
            signature?: Array<Signature>;
        };
        CreateSignatureResponse?: {
            signature?: Array<Signature>;
        };
        ModifySignatureResponse?: Record<string, unknown>;
        GetFolderResponse?: {
            folder?: Array<unknown>;
        };
        GetGrantsResponse?: {
            grant?: Array<unknown>;
        };
    };
    response?: {
        content?: unknown;
    };
};

// ============================================================
// Account service types
// ============================================================

export type CreateAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    name: string;
    password?: string;
    a?: Array<SoapAttribute>;
};

export type CreateAccountResponse = {
    account: Array<SoapEntity>;
};

export type GetAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    account: SoapEntitySelector | Array<SoapEntitySelector>;
    applyCos?: number | string;
    attrs?: string;
};

export type GetAccountResponse = {
    account: Array<SoapEntity>;
};

export type ModifyAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    a: Array<SoapAttribute>;
};

export type ModifyAccountResponse = {
    account: Array<SoapEntity>;
};

export type DeleteAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
};

export type RenameAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    newName: string;
};

export type RenameAccountResponse = {
    account: Array<SoapEntity>;
};

export type GetAccountMembershipRequest = {
    _jsns: 'urn:zimbraAdmin';
    attrs?: string;
    account: Array<SoapEntitySelector>;
};

export type GetAccountMembershipResponse = {
    dl?: Array<SoapEntity & { via?: string }>;
};

export type AddAccountAliasRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    alias: string;
};

export type RemoveAccountAliasRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    alias: string;
};

export type SetPasswordRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    newPassword?: string;
};

export type DelegateAuthRequest = {
    _jsns: 'urn:zimbraAdmin';
    account: Array<SoapEntitySelector>;
};

export type DelegateAuthResponse = {
    authToken: Array<{ _content: string }>;
    lifetime: number;
};

export type GetMailboxRequest = {
    _jsns: 'urn:zimbraAdmin';
    mbox: { id: string };
};

export type GetMailboxResponse = {
    mbox: Array<{
        mbxid: number;
        s: number;
    }>;
};

// ============================================================
// Domain service types
// ============================================================

export type CreateDomainRequest = {
    _jsns: 'urn:zimbraAdmin';
    name: string;
    a?: Array<SoapAttribute>;
};

export type CreateDomainResponse = {
    domain: Array<SoapEntity>;
    Body?: ZextrasRawResponse['Body'];
};

export type GetDomainRequest = {
    _jsns: 'urn:zimbraAdmin';
    domain: SoapEntitySelector;
    applyConfig?: number;
};

export type GetDomainResponse = {
    domain: Array<SoapEntity>;
};

export type ModifyDomainRequest = {
    _jsns?: string;
    id?: string;
    a?: Array<SoapAttribute>;
};

export type ModifyDomainResponse = {
    domain: Array<SoapEntity>;
    warning?: Array<string>;
};

export type DeleteDomainRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
};

// ============================================================
// Search Directory types (shared by search-domain, search-cos, account-list, etc.)
// ============================================================

export type SearchDirectoryRequest = {
    _jsns: 'urn:zimbraAdmin';
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortAscending?: string | number;
    applyCos?: string;
    applyConfig?: string;
    attrs?: string;
    types?: string;
    domain?: string;
    query?: string | { _content: string };
};

export type AccountSearchResult = SoapEntity;

export type DomainSearchResult = SoapEntity;

export type CosSearchResult = SoapEntity;

export type SearchAccountsResponse = SearchDirectoryResponse<'account', AccountSearchResult>;

export type SearchDomainsResponse = SearchDirectoryResponse<'domain', DomainSearchResult>;

export type SearchCosesResponse = SearchDirectoryResponse<'cos', CosSearchResult>;

export type SearchDlsResponse = SearchDirectoryResponse<'dl', SoapEntity>;

export type SearchCalResourcesResponse = SearchDirectoryResponse<'calresource', SoapEntity>;

export type CountAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    domain: {
        _content: string;
        by: 'name' | 'id';
    };
};

export type CountAccountResponse = {
    cos: Array<{
        id: string;
        name: string;
        _content: number;
    }>;
};

// ============================================================
// Distribution List / Mailing List service types
// ============================================================

export type CreateDistributionListRequest = {
    _jsns: 'urn:zimbraAdmin';
    dynamic: boolean;
    name: string;
    a?: Array<SoapAttribute>;
};

export type CreateDistributionListResponse = {
    dl: Array<SoapEntity & { dynamic: boolean }>;
};

export type GetDistributionListRequest = {
    _jsns: 'urn:zimbraAdmin';
    offset?: number;
    limit?: number;
    dl?: SoapEntitySelector;
    name?: string;
};

export type DistributionListMember = {
    _content: string;
};

export type GetDistributionListResponse = {
    dl: Array<SoapEntity & {
        dynamic?: boolean;
        total?: number;
        more?: boolean;
        dlm?: Array<DistributionListMember>;
    }>;
};

export type ModifyDistributionListRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    a?: Array<SoapAttribute>;
};

export type ModifyDistributionListResponse = {
    dl: Array<SoapEntity>;
};

export type DeleteDistributionListRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: { _content: string };
};

export type RenameDistributionListRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    newName?: string;
};

export type RenameDistributionListResponse = {
    dl: Array<SoapEntity>;
};

export type AddDistributionListMemberRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string | Record<string, string>;
    dlm?: Record<string, string>;
};

export type RemoveDistributionListMemberRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: unknown;
    dlm?: unknown;
};

export type AddDistributionListAliasRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    alias: string;
};

export type RemoveDistributionListAliasRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    alias: string;
};

export type DistributionListActionRequest = {
    _jsns: 'urn:zimbraAccount';
    dl: unknown;
    action?: unknown;
};

export type GetDistributionListMembershipRequest = {
    _jsns: 'urn:zimbraAdmin';
    dl: SoapEntitySelector;
};

export type GetDistributionListMembershipResponse = {
    dl?: Array<SoapEntity & { via?: string }>;
};

// ============================================================
// Calendar Resource service types
// ============================================================

export type CreateCalendarResourceRequest = {
    _jsns: 'urn:zimbraAdmin';
    name: string;
    password?: string;
    a?: Array<SoapAttribute>;
};

export type CreateCalendarResourceResponse = {
    calresource: Array<SoapEntity>;
};

export type GetCalendarResourceRequest = {
    _jsns: 'urn:zimbraAdmin';
    calresource: SoapEntitySelector;
    applyCos?: string;
};

export type GetCalendarResourceResponse = {
    calresource: Array<SoapEntity>;
};

export type ModifyCalendarResourceRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    a?: Array<SoapAttribute>;
};

export type ModifyCalendarResourceResponse = {
    calresource: Array<SoapEntity>;
};

export type DeleteCalendarResourceRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
};

export type RenameCalendarResourceRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
    newName?: string;
};

export type RenameCalendarResourceResponse = {
    calresource: Array<SoapEntity>;
};

// ============================================================
// COS service types
// ============================================================

export type GetCosRequest = {
    _jsns: 'urn:zimbraAdmin';
    cos: SoapEntitySelector;
};

export type GetCosResponse = {
    cos: Array<SoapEntity>;
};

export type CopyCosRequest = {
    _jsns: 'urn:zimbraAdmin';
    name: { _content: string };
    cos: SoapEntitySelector;
};

export type CopyCosResponse = {
    cos: Array<SoapEntity>;
};

// ============================================================
// GAL service types
// ============================================================

export type SearchGalRequest = {
    _jsns: 'urn:zimbraAccount';
    limit?: string;
    offset?: number;
    name?: string;
    type?: string;
};

export type GalContact = {
    id: string;
    exp?: boolean;
    isOwner?: boolean;
    _attrs?: Record<string, string>;
};

export type SearchGalResponse = {
    cn?: Array<GalContact>;
    more?: boolean;
    sortBy?: string;
    offset?: number;
    paginationSupported?: boolean;
    tokenizeKey?: boolean;
};

export type CreateGalSyncAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    name: string;
    domain?: string;
    server: string;
    type: string;
    account: Array<SoapEntitySelector>;
    folder?: string;
    a?: Array<SoapAttribute>;
};

export type CreateGalSyncAccountResponse = {
    account: SoapEntity;
};

export type SyncGalAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    account: { id?: string };
};

export type DeleteGalSyncAccountRequest = {
    _jsns: 'urn:zimbraAdmin';
    account: SoapEntitySelector;
};

export type GetCreateObjectAttrsRequest = {
    _jsns: 'urn:zimbraAdmin';
    target?: Array<{ type: string; by?: string; _content?: string }>;
    domain?: Array<SoapEntitySelector>;
};

export type GetCreateObjectAttrsResponse = {
    setAttrs?: Array<{
        a?: Array<SoapAttribute & { default?: string }>;
    }>;
};

// ============================================================
// Config service types
// ============================================================

export type GetAllConfigRequest = {
    _jsns: 'urn:zimbraAdmin';
};

export type GetAllConfigResponse = {
    a: Array<Attribute>;
};

export type ModifyConfigRequest = {
    _jsns: 'urn:zimbraAdmin';
    a: Array<SoapAttribute>;
};

export type FlushCacheRequest = {
    _jsns: 'urn:zimbraAdmin';
    cache: {
        type: string;
        allServers?: number;
        entry?: {
            _content?: string;
            by?: string;
        };
    };
};

// ============================================================
// Auth / Check service types
// ============================================================

export type CheckAuthConfigRequest = {
    name?: string;
    password?: string;
    _jsns?: string;
    a?: Array<SoapAttribute>;
};

export type CheckAuthConfigResponse = {
    code: Array<{ _content: string }>;
    message?: string;
    bindDn?: string;
};

export type CheckRightRequest = {
    _jsns: 'urn:zimbraAdmin';
    target: {
        _content: string;
        type: string;
        by: 'name' | 'id';
    };
    grantee: {
        _content: string;
        by: 'name' | 'id';
    };
    right: {
        _content: string;
    };
};

export type CheckRightResponse = {
    allow: boolean;
    via?: {
        target: { type: string; _content: string };
        grantee: { type: string; _content: string };
        right: { _content: string };
    };
};

export type GetGrantsRequest = {
    _jsns: 'urn:zimbraAdmin';
    target?: {
        _content?: string;
        type?: string;
        by?: string;
    };
};

export type GetGrantsResponse = {
    grant?: Array<{
        target: { type: string; _content: string };
        grantee: { type: string; _content: string };
        right: { _content: string };
    }>;
};

// ============================================================
// Session service types
// ============================================================

export type GetSessionsRequest = {
    _jsns: 'urn:zimbraAdmin';
    type: string;
    offset?: number;
    sortBy?: string;
    refresh?: number;
};

export type SessionInfo = {
    zid: string;
    name: string;
    sid: string;
    cd: number;
    ld: number;
    s?: number;
};

export type GetSessionsResponse = {
    total: number;
    more: boolean;
    s?: Array<SessionInfo>;
};

export type EndSessionRequest = {
    _jsns: 'urn:zimbraAccount';
    sessionId: string;
    logoff: number;
    all: number;
    excludeCurrent: number;
};

// ============================================================
// Quota usage service types
// ============================================================

export type GetQuotaUsageRequest = {
    _jsns: 'urn:zimbraAdmin';
    sortBy?: string;
    offset?: number;
    limit?: number;
    refresh?: string;
    domain?: string;
    allServers?: string;
};

export type QuotaUsageAccount = {
    name: string;
    id: string;
    used: number;
    limit: number;
};

export type GetQuotaUsageResponse = {
    account?: Array<QuotaUsageAccount>;
    more: boolean;
    searchTotal: number;
};

// ============================================================
// DataSource service types
// ============================================================

export type GetDataSourcesRequest = {
    _jsns: 'urn:zimbraAdmin';
    id: string;
};

export type DataSource = {
    id: string;
    name: string;
    type: string;
    a?: Array<Attribute>;
    _attrs?: Record<string, string>;
};

export type GetDataSourcesResponse = {
    dataSource?: Array<DataSource>;
};

export type ModifyDataSourceRequest = {
    _jsns?: string;
    id?: string;
    dataSource?: {
        id?: string;
        a?: Array<SoapAttribute>;
    };
};

// ============================================================
// Certificate service types
// ============================================================

export type IssueCertRequest = {
    _jsns: 'urn:zimbraAdmin';
    domain?: string;
    chainType: string;
};

export type IssueCertResponse = {
    cert?: string;
    ca_cert?: string;
};

// ============================================================
// Mobile / Device service types
// ============================================================

export type MobileDeviceAction =
    | 'doResetDevice'
    | 'doSuspendDeviceSync'
    | 'doWipeDevice'
    | 'doRemoveDevice'
    | 'getDeviceStatistics'
    | 'getAllDevices'
    | 'doPurgeMobileState';

export type MobileDeviceRequest = {
    _jsns: 'urn:zimbraAdmin';
    module: string;
    action: MobileDeviceAction;
    accountName?: string;
    deviceId?: string;
    targetServers?: string;
    domainList?: string;
    confirm?: boolean;
};

export type DeviceInfo = {
    device_id: string;
    status: string;
    protocol_version: string;
    device_type: string;
    user_agent?: string;
    first_req_received?: number;
    last_used_date?: number;
    last_updated_by_device?: string;
};

export type GetAllDevicesResponse = {
    devices?: Array<{
        account: string;
        deviceList: Array<DeviceInfo>;
    }>;
};

// ============================================================
// Anti-DoS mobile config types
// ============================================================

export type ZextrasConfigAttribute =
    | 'mobileAntiDosServiceEnabled'
    | 'mobileAntiDosServiceMaxRequests'
    | 'mobileAntiDosServiceTimeWindow'
    | 'mobileAntiDosServiceJailDuration';

export type GetGlobalConfigRequest = {
    _jsns: 'urn:zimbraAdmin';
    module: string;
    action: string;
    command: string;
    attribute: ZextrasConfigAttribute;
};

export type SetGlobalConfigRequest = {
    _jsns: 'urn:zimbraAdmin';
    module: string;
    action: string;
    command: string;
    attribute: ZextrasConfigAttribute;
    value: string | number | boolean;
};

export type AntiDosJailAction = {
    _jsns: 'urn:zimbraAdmin';
    module: string;
    action: string;
    service_name: string;
    targetServers: string;
};

// ============================================================
// 2FA / Auth policy types
// ============================================================

export type List2faPoliciesRequest = {
    _jsns: 'urn:zimbraAdmin';
    module: 'ZxAuth';
    action: 'listPolicies';
    level: 'global' | 'domain';
    domain?: string;
};

export type TwoFaPolicyEntry = {
    service: string;
    trustedDevice?: number;
    trustedIpRange?: string;
};

export type List2faPoliciesResponse = {
    policies?: Array<TwoFaPolicyEntry>;
};

export type Set2faPoliciesRequest = {
    _jsns: 'urn:zimbraAdmin';
    module: 'ZxAuth';
    action: 'setPolicy';
    level: 'global' | 'domain';
    domain?: string;
    service: string;
    trustedDevice?: number;
    trustedIpRange?: string;
};

// ============================================================
// OTP service types
// ============================================================

export type OtpEntry = {
    label: string;
    uri: string;
    secret: string;
};

export type ListOtpResponse = {
    otps?: Array<OtpEntry>;
};

// ============================================================
// Signature service types
// ============================================================

export type SignatureContent = {
    type: 'text/plain' | 'text/html';
    _content: string;
};

export type Signature = {
    id?: string;
    name: string;
    content: SignatureContent;
};

export type CreateSignatureRequest = {
    _jsns: 'urn:zimbraAccount';
    signature: {
        name: string;
        content: SignatureContent;
    };
};

export type GetSignaturesResponse = {
    signature?: Array<Signature>;
    Body?: {
        GetSignaturesResponse?: {
            signature?: Array<Signature>;
        };
        Fault?: {
            Reason?: {
                Text?: string;
            };
        };
    };
};

export type ModifySignatureRequest = {
    _jsns: 'urn:zimbraAccount';
    signature: {
        name: string;
        id: string;
        content: SignatureContent;
    };
};

export type DeleteSignatureRequest = {
    _jsns: 'urn:zimbraAccount';
    signature: { id: string };
};

// ============================================================
// Mail / Quarantine service types
// ============================================================

export type BounceMessageInfo = {
    id: string;
    envelopeTo: string;
    envelopeFrom: string;
};

export type BounceMsgRequest = {
    _jsns: 'urn:zimbraMail';
    m: {
        id: string;
        e: Array<{
            t: string;
            a: string;
        }>;
    };
};

export type MsgActionRequest = {
    _jsns: 'urn:zimbraMail';
    action: {
        id: string;
        op: string;
    };
};

export type RemoveAttachmentsRequest = {
    _jsns: 'urn:zimbraMail';
    m: {
        id: string;
        part: string;
    };
};

export type SearchMailRequest = {
    _jsns: 'urn:zimbraMail';
    limit?: number;
    needExp?: number;
    recip?: string;
    fullConversation?: number;
    wantContent?: string;
    sortBy?: string;
    types?: string;
};

export type MailMessage = {
    id: string;
    d?: number;
    s?: number;
    l?: string;
    f?: string;
    su?: string;
    fr?: string;
    e?: Array<{
        t: string;
        a: string;
        d?: string;
        p?: string;
    }>;
    mp?: Array<{
        ct: string;
        s?: number;
        part: string;
        body?: boolean;
        content?: string;
        mp?: Array<unknown>;
    }>;
};

export type SearchMailResponse = {
    m?: Array<MailMessage>;
    more: boolean;
    offset: number;
    sortBy: string;
};

// ============================================================
// Batch service types
// ============================================================

export type BatchRequest = Record<string, unknown>;

export type BatchResponse = Record<string, unknown>;

// ============================================================
// SAML configuration types
// ============================================================

export type SamlAttribute = {
    key: string;
    value: string;
};

export type GetSamlConfigResponse = {
    error?: string;
    attributes?: Array<SamlAttribute>;
    certificate?: string;
    entityId?: string;
    loginUrl?: string;
    logoutUrl?: string;
};

// ============================================================
// Restore / Delete account types
// ============================================================

export type RestoreDeleteAccountRequest = {
    accounts: Array<{
        name: string;
        id: string;
        serverName: string;
    }>;
};

export type RestoreDeleteAccountResponse = {
    error?: {
        details?: {
            cause?: string;
        };
        message?: string;
    };
    operationId?: string;
    status?: number;
};

// ============================================================
// Init domain for delegation types
// ============================================================

export type InitDomainForDelegationRequest = Record<string, unknown>;

export type InitDomainForDelegationResponse = Record<string, unknown>;

// ============================================================
// File Quota types (REST API)
// ============================================================

export type FileQuotaUsageAccount = {
    accountId: string;
    totalUsed: number;
    limit?: number;
};

export type FileQuotaUsageResponse = {
    accounts?: Array<FileQuotaUsageAccount>;
    total?: number;
};

export type FileQuotaResponse = {
    limit?: number;
};
