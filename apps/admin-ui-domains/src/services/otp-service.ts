/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './generateOTP-service';

export type TotpGenerateResponse = {
  ok?: boolean | string;
  response?: {
    label?: string;
    secret?: string;
    issuer?: string;
    algorithm?: string;
    digits_length?: string;
    period?: string;
    static_otp_codes?: Array<{ code: string }>;
  };
};

export type TotpMutationResponse = {
  ok?: boolean | string;
};

export const generateTotp = (account: string): Promise<TotpGenerateResponse> =>
  fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxAuth',
    action: 'totp_generate_command',
    account,
  });

export const deleteTotp = (account: string, id: string): Promise<TotpMutationResponse> =>
  fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxAuth',
    action: 'delete_totp_command',
    account,
    id,
  });

/**
 * Restores a deleted TOTP. `fetchSoap` already unwraps and JSON-parses
 * `Body.response.content`; the nested `response.content` shape is parsed here
 * so every wrapping seen in the wild resolves to a plain `{ ok }` object.
 */
export const restoreTotp = async (account: string, id: string): Promise<TotpMutationResponse> => {
  const res = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxAuth',
    action: 'restore-otp',
    account,
    id,
  });
  const content = (res as { response?: { content?: unknown } })?.response?.content;
  if (typeof content === 'string') {
    try {
      return JSON.parse(content) as TotpMutationResponse;
    } catch {
      return res;
    }
  }
  if (content && typeof content === 'object') {
    return content as TotpMutationResponse;
  }
  return res;
};
