/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forOwn } from 'lodash';
import { ComponentType } from 'react';

import { IShellWindow, CarbonioModule } from '../../../types';
import * as CONSTANTS from '../../constants';
import { report } from '../../reporting';
import { useAppStore } from '../../store/app';
import { AppLink } from '../../ui-extras/app-link';

import { getAppFunctions } from './app-loader-functions';
import { getAppSetters } from './app-loader-setters';

const _scripts: { [pkgName: string]: HTMLScriptElement } = {};
let _scriptId = 0;

function loadAppModule(appPkg: CarbonioModule): Promise<CarbonioModule> {
	return new Promise((_resolve, _reject) => {
		let resolved = false;
		const resolve: (...args: any[]) => void = (...args) => {
			if (!resolved) {
				resolved = true;
				_resolve(appPkg);
			}
		};
		const reject: (e: Error) => void = (e) => {
			if (!resolved) {
				resolved = true;
				_reject(e);
			}
		};
		try {
			// DO NOT RENAME THIS
			(window as unknown as IShellWindow).__ZAPP_SHARED_LIBRARIES__['@zextras/admin-ui-bootstrap'][
				appPkg.name
			] = {
				report: report(appPkg.name),
				AppLink,
				...getAppSetters(appPkg),
				...getAppFunctions(appPkg),
				...CONSTANTS
			};

			(window as unknown as IShellWindow).__ZAPP_HMR_EXPORT__[appPkg.name] = (
				appComponent: ComponentType
			): void => {
				useAppStore.setState((state) => ({
					entryPoints: {
						...state.entryPoints,
						[appPkg.name]: appComponent
					}
				}));
				console.info(
					`%c loaded ${appPkg.name}`,
					'color: white; background: #539507;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%'
				);
				resolve(appPkg);
			};

			// if (FLAVOR === 'NPM' && typeof cliSettings !== 'undefined' && cliSettings.hasHandlers) {

			// (
			// 	window as unknown as IShellWindow<SharedLibrariesAppsMap, ComponentClass>
			// ).__ZAPP_HMR_HANDLERS__[appPkg.name] = (handlers: RequestHandlersList): void =>
			// 	updateAppHandlers(appPkg, handlers);
			// }
			const script: HTMLScriptElement = document.createElement('script');
			script.setAttribute('type', 'text/javascript');
			script.setAttribute('data-pkg_name', appPkg.name);
			script.setAttribute('data-pkg_version', appPkg.version);
			script.setAttribute('data-is_app', 'true');
			script.setAttribute('src', `${appPkg.js_entrypoint}`);
			document.body.appendChild(script);
			_scripts[`${appPkg.name}-loader-${(_scriptId += 1)}`] = script;
		} catch (err) {
			console.error(err);

			// @ts-ignore
			reject(err);
		}
	});
}

export function loadApp(pkg: CarbonioModule): Promise<CarbonioModule> {
	return loadAppModule(pkg);
}

export function unloadApps(): Promise<void> {
	return Promise.resolve().then(() => {
		forOwn(_scripts, (script) => {
			if (script.parentNode) script.parentNode.removeChild(script);
		});
	});
}
