/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod';

export const S3_CONNECTOR_VALIDATION_MESSAGES: Record<string, string> = {
  's3.field_required': 'This field is mandatory',
  's3.no_whitespace': "This field can't be blank or have white space",
  's3.endpoint_required': "This field is required when Region is 'None' or 'Custom'",
  's3.prefix_invalid':
    'The prefix should not contain spaces. The allowed letters are a-z, A-Z, and special characters /-.',
};

const NO_WHITESPACE = /^\S+$/;
const PREFIX_PATTERN = /^[A-Za-z0-9_./-]*$/;
export const CUSTOM_REGION_VALUE = 'SET_CUSTOM_REGION';
export const NO_REGION_VALUE = '';

const s3ConnectorBase = z.object({
  bucketLabel: z.string(),
  bucketName: z.string(),
  accessKey: z.string(),
  secretKey: z.string(),
  shouldChangeSecret: z.boolean(),
  url: z.string(),
  prefix: z.string(),
  customRegion: z.string(),
  regionValue: z.string(),
  acceptUntrustedSSL: z.boolean(),
});

export const s3ConnectorSchema = s3ConnectorBase.superRefine((val, ctx) => {
  if (!val.bucketLabel) {
    ctx.addIssue({ code: 'custom', path: ['bucketLabel'], message: 's3.field_required' });
  }
  if (!val.bucketName || !NO_WHITESPACE.test(val.bucketName)) {
    ctx.addIssue({ code: 'custom', path: ['bucketName'], message: 's3.no_whitespace' });
  }
  if (!val.accessKey || !NO_WHITESPACE.test(val.accessKey)) {
    ctx.addIssue({ code: 'custom', path: ['accessKey'], message: 's3.no_whitespace' });
  }
  if (
    val.shouldChangeSecret &&
    val.secretKey.trim() !== '' &&
    !NO_WHITESPACE.test(val.secretKey)
  ) {
    ctx.addIssue({ code: 'custom', path: ['secretKey'], message: 's3.no_whitespace' });
  }

  const isCustomRegion = val.regionValue === CUSTOM_REGION_VALUE;
  const isEndpointRequired = isCustomRegion || val.regionValue === NO_REGION_VALUE;

  if (isEndpointRequired && (!val.url.trim() || !NO_WHITESPACE.test(val.url.trim()))) {
    ctx.addIssue({ code: 'custom', path: ['url'], message: 's3.endpoint_required' });
  }

  if (isCustomRegion && !NO_WHITESPACE.test(val.customRegion)) {
    ctx.addIssue({ code: 'custom', path: ['customRegion'], message: 's3.no_whitespace' });
  }

  if (val.prefix.trim() && !PREFIX_PATTERN.test(val.prefix.trim())) {
    ctx.addIssue({ code: 'custom', path: ['prefix'], message: 's3.prefix_invalid' });
  }
});
