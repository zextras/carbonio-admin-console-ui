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
    static_otp_codes?: Array<string>;
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

export const restoreTotp = (account: string, id: string): Promise<TotpMutationResponse> =>
  fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxAuth',
    action: 'restore-otp',
    account,
    id,
  });
