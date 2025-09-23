/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filter, map } from 'lodash';

import { CarbonioModule } from '../../../types';
import { SHELL_APP_ID } from '../../constants';
import StoreFactory from '../../redux/store-factory';
import { useReporter } from '../../reporting';
import { getUserSetting } from '../../store/account';

import { loadApp, unloadApps } from './load-app';
import { injectSharedLibraries } from './shared-libraries';

export function loadApps(storeFactory: StoreFactory, apps: Array<CarbonioModule>): void {
	injectSharedLibraries();
	const appsToLoad = filter(apps, (app) => {
		if (app.name === SHELL_APP_ID) return false;
		return !(app.attrKey && getUserSetting('attrs', app.attrKey) !== 'TRUE');
	});
	useReporter.getState().setClients(appsToLoad);
	Promise.allSettled(map(appsToLoad, (app) => loadApp(app, storeFactory)));
}

export function unloadAllApps(): Promise<void> {
	return unloadApps();
}
