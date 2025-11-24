/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContextBridge } from '@zextras/admin-ui-bootstrap/testing';
import { ModalManager, SnackbarManager, ThemeProvider } from '@zextras/carbonio-design-system';
import i18next, { type i18n } from 'i18next';
import React, { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useHistory, BrowserRouter } from 'react-router-dom';

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
	queryClient?: QueryClient;
};

export const getQueryClient = (): QueryClient => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: Infinity,
				refetchOnMount: false,
				refetchOnWindowFocus: false,
				refetchOnReconnect: false
			}
		}
	});
};

export const I18NextTestProvider = ({
	children
}: {
	children: React.ReactNode;
}): React.JSX.Element => {
	const i18nInstance = useMemo(() => getAppI18n(), []);

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

export const BootstrapBridgeProvider = ({
	children
}: {
	children: React.ReactNode;
}): React.JSX.Element => {
	const history = useHistory();
	const createSnackbar = () => ({});
	const createModal = () => ({});

	// Initialize the context bridge immediately and synchronously
	const { add } = useContextBridge.getState();
	add({
		functions: {
			getHistory: () => history,
			createSnackbar,
			createModal
		}
	});

	return <>{children}</>;
};

export const Wrapper = ({
	children,
	queryClient: providedQueryClient
}: WrapperProps): React.JSX.Element => {
	const defaultQueryClient = useMemo(() => getQueryClient(), []);
	const queryClient = providedQueryClient ?? defaultQueryClient;

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<SnackbarManager>
						<I18NextTestProvider>
							<ModalManager>
								<BootstrapBridgeProvider>{children}</BootstrapBridgeProvider>
							</ModalManager>
						</I18NextTestProvider>
					</SnackbarManager>
				</ThemeProvider>
			</QueryClientProvider>
		</BrowserRouter>
	);
};
