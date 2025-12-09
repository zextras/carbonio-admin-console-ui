/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filter, map } from 'lodash';

import { CarbonioModule } from '../../../types';
import { SHELL_APP_ID } from '../../constants';
import { getUserSetting } from '../../react-query/use-account';
import { useI18nStore } from '../../store/i18n/store';

import { loadApp, unloadApps } from './load-app';
import { injectSharedLibraries } from './shared-libraries';

export function loadApps(apps: Array<CarbonioModule>): void {
	injectSharedLibraries();
	const appsToLoad = filter(apps, (app) => {
		if (app.name === SHELL_APP_ID) return false;
		return !(app.attrKey && getUserSetting('attrs', app.attrKey) !== 'TRUE');
	});

	const { locale, addI18n } = useI18nStore.getState();
	addI18n(appsToLoad, locale);
	Promise.allSettled(map(appsToLoad, (app) => loadApp(app)));
}

export function unloadAllApps(): Promise<void> {
	return unloadApps();
}
