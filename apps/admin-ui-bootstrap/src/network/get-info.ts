/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GetInfoResponse } from '../../types';
import { useAccountStore } from '../store/account';
import { normalizeAccount } from '../store/account/normalization';

import { soapFetch } from './fetch';

export const getInfo = (): Promise<void> =>
	soapFetch<{ _jsns: string; rights: string }, GetInfoResponse>('GetInfo', {
		_jsns: 'urn:zimbraAccount',
		rights: 'sendAs,sendAsDistList,viewFreeBusy,sendOnBehalfOf,sendOnBehalfOfDistList'
	}).then((res: any): void => {
		if (res) {
			const { account, settings, version } = normalizeAccount(res);
			useAccountStore.setState({
				account,
				settings,
				zimbraVersion: version
			});
		}
	});
