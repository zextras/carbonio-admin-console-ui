/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { loadApps } from './app/load-apps';
import I18nFactory from '../i18n/i18n-factory';
import { getAllConfig } from '../network/get-all-config';
import { getInfo } from '../network/get-info';
import { getMinMaxAPIVersion } from '../network/get-min-max-api-version';
import { isAdvancedSupported } from '../network/isAdvancedSupported';
import { loginConfig } from '../network/login-config';
import StoreFactory from '../redux/store-factory';
import { useAccountStore } from '../store/account';
import { useAppStore } from '../store/app';

type InitError = {
	error: string;
};
export const init = (
	_i18nFactory: I18nFactory,
	_storeFactory: StoreFactory
): Promise<InitError | void> =>
	isAdvancedSupported().then(async (response): Promise<InitError | void> => {
		if ('errorMessage' in response) {
			return { error: response.errorMessage };
		}
		let initialCalls;
		if (response.supported) {
			initialCalls = Promise.all([getInfo(), loginConfig(), getAllConfig(), getMinMaxAPIVersion()]);
		} else {
			initialCalls = getInfo();
		}
		return initialCalls
			.then(() => {
				_i18nFactory.setLocale(
					(
						(useAccountStore.getState().settings?.prefs?.zimbraPrefLocale as string) ??
						(useAccountStore.getState().settings?.attrs?.zimbraLocale as string)
					)?.split?.('_')?.[0] ?? 'en'
				);
				loadApps(_storeFactory, Object.values(useAppStore.getState().apps));
			})
			.catch((error: Error) => ({ error: error.message }));
	});
