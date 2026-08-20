/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './generateOTP-service';

export type AddCredentialResponse = {
	ok?: boolean;
	response?: {
		list?: {
			label?: string;
			services?: string;
		};
		text_data?: {
			password?: string;
		};
	};
};

export const addCredential = async (
	account: string,
	label: string,
	services: string
): Promise<AddCredentialResponse> =>
	fetchSoap('zextras', {
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxAuth',
		action: 'credential',
		request: 'add',
		account,
		label,
		services
	});
