/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ZIMBRA_ADMIN_URN } from '../constants';
import type { AddCredentialResponse } from './add-credential';
import { fetchSoap } from './generateOTP-service';

export const deleteCredential = async (
	account: string,
	passwordId: string,
): Promise<AddCredentialResponse> =>
	fetchSoap('zextras', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxAuth',
		action: 'credential',
		request: 'delete',
		account,
		password_id: passwordId,
	});
