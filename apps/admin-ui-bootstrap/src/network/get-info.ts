/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GetInfoResponse } from '../../types';
import { queryClient } from '../providers/react-query-provider';

import { normalizeAccount } from './account-api';
import { soapFetch } from './fetch';

export const getInfo = (): Promise<void> =>
	soapFetch<{ _jsns: string; rights: string }, GetInfoResponse>('GetInfo', {
		_jsns: 'urn:zimbraAccount',
		rights: 'sendAs,sendAsDistList,viewFreeBusy,sendOnBehalfOf,sendOnBehalfOfDistList'
	}).then((res: any): void => {
		if (res) {
			const { account, settings, version } = normalizeAccount(res);
			queryClient.setQueryData(['account', 'info'], account);
			queryClient.setQueryData(['account', 'settings'], settings);
			queryClient.setQueryData(['account', 'version'], version);
		}
	});
