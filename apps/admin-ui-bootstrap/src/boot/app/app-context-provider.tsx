/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';

import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import { I18nextProvider } from 'react-i18next';

import AppErrorCatcher from './app-error-catcher';
import { getApp, getShell } from '../../store/app';
import { useI18nFactory } from '../bootstrapper-context';

const AppContextProvider: FC<{ pkg: string; children: React.ReactNode | React.ReactNode[] }> = ({
	pkg,
	children
}) => {
	const i18nFactory = useI18nFactory();
	const app = useMemo(() => getApp(pkg)() ?? getShell(), [pkg]);
	const i18n = useMemo(() => i18nFactory.getAppI18n(app), [i18nFactory, app]);
	return (
		<I18nextProvider i18n={i18n}>
			<ModalManager>
				<SnackbarManager>
					<AppErrorCatcher>{children}</AppErrorCatcher>
				</SnackbarManager>
			</ModalManager>
		</I18nextProvider>
	);
};

export default AppContextProvider;
