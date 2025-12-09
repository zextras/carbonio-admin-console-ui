/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SnackbarManager, ModalManager } from '@zextras/carbonio-design-system';
import React, { FC, useEffect, useMemo, useState } from 'react';

import I18nFactory from '../i18n/i18n-factory';
import { ReactQueryProvider } from '../providers/react-query-provider';
import { useBridge } from '../store/context-bridge';
import { TrackerProvider } from '../tracker/provider';

import { unloadAllApps } from './app/load-apps';
import BootstrapperContextProvider from './bootstrapper-provider';
import BootstrapperRouter from './bootstrapper-router';
import { ErrorPage } from './error-page';
import { init } from './init';
import { ThemeProvider } from './theme-provider';

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
	const [error, setError] = useState(false);
	useEffect(() => {
		init(i18nFactory).then((response) => {
			if (response && 'error' in response) {
				setError(true);
			}
		});
		return () => {
			unloadAllApps();
		};
	}, [i18nFactory]);
	return (
		<ReactQueryProvider>
			<ThemeProvider>
				{error ? (
					<ErrorPage />
				) : (
					<SnackbarManager>
						<ModalManager>
							<TrackerProvider>
								<BootstrapperContextProvider i18nFactory={i18nFactory}>
									<TBridge i18nFactory={i18nFactory} />
									<BootstrapperRouter />
								</BootstrapperContextProvider>
							</TrackerProvider>
						</ModalManager>
					</SnackbarManager>
				)}
			</ThemeProvider>
		</ReactQueryProvider>
	);
};

export default Bootstrapper;
