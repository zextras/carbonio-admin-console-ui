/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';

import { SnackbarManager, ModalManager } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { registerDefaultViews } from './app/default-views';
import { unloadAllApps } from './app/load-apps';
import BootstrapperContextProvider from './bootstrapper-provider';
import BootstrapperRouter from './bootstrapper-router';
import { ErrorPage } from './error-page';
import { init } from './init';
import { ThemeProvider } from './theme-provider';
import I18nFactory from '../i18n/i18n-factory';
import StoreFactory from '../redux/store-factory';
import { useBridge } from '../store/context-bridge';

const DefaultViewsRegister: FC = () => {
	const [t] = useTranslation();
	useEffect(() => {
		registerDefaultViews(t);
	}, [t]);
	return null;
};

const TBridge: FC<{ i18nFactory: I18nFactory }> = ({ i18nFactory }) => {
	useBridge({
		functions: {},
		packageDependentFunctions: {
			t: (app) => i18nFactory.getAppI18n({ name: app }).t
		}
	});
	return null;
};

const Bootstrapper: FC = () => {
	const i18nFactory = useMemo(() => new I18nFactory(), []);
	const storeFactory = useMemo(() => new StoreFactory(), []);
	const [error, setError] = useState(false);
	useEffect(() => {
		init(i18nFactory, storeFactory).then((response) => {
			if (response && 'error' in response) {
				setError(true);
			}
		});
		return () => {
			unloadAllApps();
		};
	}, [i18nFactory, storeFactory]);
	return (
		<ThemeProvider>
			{error ? (
				<ErrorPage />
			) : (
				<SnackbarManager>
					<ModalManager>
						<BootstrapperContextProvider i18nFactory={i18nFactory} storeFactory={storeFactory}>
							<TBridge i18nFactory={i18nFactory} />
							<DefaultViewsRegister />
							<BootstrapperRouter />
						</BootstrapperContextProvider>
					</ModalManager>
				</SnackbarManager>
			)}
		</ThemeProvider>
	);
};

export default Bootstrapper;
