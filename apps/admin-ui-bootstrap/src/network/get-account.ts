/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccountStore } from '../store/account';
import { useI18nStore } from '../store/i18n/store';

import { soapFetch } from './fetch';

export const getAccount = async (): Promise<void> => {
	const { account } = useAccountStore.getState();

	if (!account?.name) {
		console.warn('No account name available for GetAccount request');
		return Promise.resolve();
	}

	return soapFetch<{ _jsns: string; account: { by: string; _content: string } }, any>(
		'GetAccount',
		{
			_jsns: 'urn:zimbraAdmin',
			account: {
				by: 'name',
				_content: account.name
			}
		}
	).then((res: any): void => {
		if (res?.a && Array.isArray(res.a)) {
			// Find zimbraPrefLocale attribute
			const localeAttr = res.a.find((attr: any) => attr.n === 'zimbraPrefLocale');

			if (localeAttr?._content) {
				const userLocale = localeAttr._content.split('_')[0] ?? 'en';
				useI18nStore.getState().setLocale(userLocale);
			}
		}
	});
};
