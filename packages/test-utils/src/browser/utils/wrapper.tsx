/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManager, SnackbarManager, ThemeProvider } from '@zextras/carbonio-design-system';
import i18next, { type i18n } from 'i18next';
import React, { useLayoutEffect, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, useHistory } from 'react-router-dom';

const getAppI18n = (): i18n => {
	const newI18n = i18next.createInstance();
	newI18n.init({
		lng: 'en',
		fallbackLng: 'en',
		debug: false,
		interpolation: {
			escapeValue: false
		},
		resources: { en: { translation: {} } }
	});
	return newI18n;
};

export type WrapperProps = {
	children?: React.ReactNode;
};

export const I18NextTestProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const i18nInstance = useMemo(() => getAppI18n(), []);

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

/**
 * Sets up the context bridge with the current router history
 * This is needed for replaceHistory and pushHistory to work in tests
 */
const ContextBridgeSetup = (): null => {
	const history = useHistory();
	
	useLayoutEffect(() => {
		// Try to dynamically import and set up the context bridge
		// Use a synchronous check first to see if it's already available
		try {
			// @ts-expect-error - Dynamic import for testing
			const bootstrap = window['@zextras/admin-ui-bootstrap'];
			if (bootstrap?.useContextBridge) {
				bootstrap.useContextBridge.getState().add({
					functions: {
						getHistory: () => history
					}
				});
				return;
			}
		} catch {
			// Module not available in window, try dynamic import
		}
		
		// Fall back to async import
		import('@zextras/admin-ui-bootstrap')
			.then((module) => {
				if (module.useContextBridge) {
					module.useContextBridge.getState().add({
						functions: {
							getHistory: () => history
						}
					});
				}
			})
			.catch(() => {
				// Module not available or doesn't export useContextBridge
				console.debug('Could not set up context bridge - history functions may not work');
			});
	}, [history]);
	
	return null;
};

export const Wrapper = ({ children }: WrapperProps): JSX.Element => (
	<BrowserRouter>
		<ContextBridgeSetup />
		<ThemeProvider>
			<SnackbarManager>
				<I18NextTestProvider>
					<ModalManager>{children}</ModalManager>
				</I18NextTestProvider>
			</SnackbarManager>
		</ThemeProvider>
	</BrowserRouter>
);
