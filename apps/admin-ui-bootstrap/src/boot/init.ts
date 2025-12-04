/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import I18nFactory from '../i18n/i18n-factory';
import { getAccount } from '../network/get-account';
import { getInfo } from '../network/get-info';
import { loginConfig } from '../network/login-config';
import { queryFnIsAdvancedSupported } from '../react-query/use-is-advanced-supported';
import { useAccountStore } from '../store/account';
import { useAppStore } from '../store/app';
import { useI18nStore } from '../store/i18n/store';

import { loadApps } from './app/load-apps';

type InitError = {
	error: string;
};
export const init = (_i18nFactory: I18nFactory): Promise<InitError | void> =>
	queryFnIsAdvancedSupported().then(async (supported): Promise<InitError | void> => {
		if (!supported) {
			return { error: 'Advanced is not supported' };
		}
		let initialCalls;
		if (supported) {
			initialCalls = Promise.all([getInfo(), loginConfig()]);
		} else {
			initialCalls = Promise.all([getInfo()]);
		}
		return initialCalls
			.then(() => {
				// First get the admin account information for zimbraPrefLocale
				return getAccount();
			})
			.then(() => {
				// Fallback to GetInfo locale if GetAccount didn't provide one
				const currentLocale = useI18nStore.getState().locale;
				if (currentLocale === 'en') {
					const fallbackLocale =
						(
							(useAccountStore.getState().settings?.prefs?.zimbraPrefLocale as string) ??
							(useAccountStore.getState().settings?.attrs?.zimbraLocale as string)
						)?.split?.('_')?.[0] ?? 'en';

					if (fallbackLocale !== 'en') {
						_i18nFactory.setLocale(fallbackLocale);
						useI18nStore.getState().setLocale(fallbackLocale);
					}
				} else {
					// Update the old i18n factory to match the new store
					_i18nFactory.setLocale(currentLocale);
				}
				loadApps(Object.values(useAppStore.getState().apps));
			})
			.catch((error: Error) => ({ error: error.message }));
	});
