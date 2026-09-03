/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

export type S3ConnectorFormValues = {
  bucketLabel: string;
  bucketName: string;
  accessKey: string;
  secretKey: string;
  shouldChangeSecret: boolean;
  url: string;
  prefix: string;
  customRegion: string;
  regionValue: string;
  acceptUntrustedSSL: boolean;
};

export type S3ConnectorFormApi = ReactFormExtendedApi<
  S3ConnectorFormValues,
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
