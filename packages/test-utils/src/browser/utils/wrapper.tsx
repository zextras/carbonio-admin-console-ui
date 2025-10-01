/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ModalManager, SnackbarManager, ThemeProvider } from '@zextras/carbonio-design-system';
import i18next, { type i18n } from 'i18next';
import React, { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

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
	initialRouterEntries?: string[];
};

export const I18NextTestProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const i18nInstance = useMemo(() => getAppI18n(), []);

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

export const Wrapper = ({ initialRouterEntries, children }: WrapperProps): JSX.Element => (
	<MemoryRouter
		initialEntries={initialRouterEntries}
		initialIndex={(initialRouterEntries?.length || 1) - 1}
	>
		<ThemeProvider>
			<SnackbarManager>
				<I18NextTestProvider>
					<ModalManager>{children}</ModalManager>
				</I18NextTestProvider>
			</SnackbarManager>
		</ThemeProvider>
	</MemoryRouter>
);
