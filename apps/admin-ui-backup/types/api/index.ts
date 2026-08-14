/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BucketItem } from '../backup';

export type SoapResponseBody<T = unknown> = {
  Body: {
    response: {
      content: string;
    };
  } & T;
};

export type SoapErrorResponse = {
  status?: number;
  statusText?: string;
  error?: string | { message?: string; details?: { cause?: string } };
  errors?: Array<{ error?: string }>;
};

export type ExternalSoapResponse = {
  ok?: boolean;
  serverId?: string;
  error?: {
    message?: string;
    details?: {
      cause?: string;
    };
  };
};

export type CheckLdapResponse = {
  ok?: boolean;
};

export type DumpGlobalConfigResponse = SoapResponseBody;

export type SetCoreAttributesResponse = SoapErrorResponse;

export type ModifyBackupResponse = SoapErrorResponse & {
  status?: number;
};

export type ListBucketsContent = {
  ok: boolean;
  response: {
    values: Array<BucketItem>;
  };
};
