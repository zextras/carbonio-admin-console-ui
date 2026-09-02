/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export type CheckAuthConfigBody = {
  name?: string;
  password?: string;
  _jsns?: string;
  a?: Array<{ n: string; _content?: string }>;
};

export type CheckAuthConfigResponse = {
  code?: Array<{ _content?: string }>;
};

export function checkAuthConfig(body: CheckAuthConfigBody): Promise<CheckAuthConfigResponse> {
  return soapFetch(`CheckAuthConfig`, {
    ...body,
  });
}

/** @deprecated Use checkAuthConfig */
export const CheckAuthConfig = checkAuthConfig;
