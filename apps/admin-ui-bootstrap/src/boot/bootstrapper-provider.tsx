/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';

import { I18nextProvider } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BootstrapperContext } from './bootstrapper-context';
import { SHELL_APP_ID } from '../constants';
import I18nFactory from '../i18n/i18n-factory';
import BoardContextProvider from '../shell/boards/board-context-provider';
import { useI18nStore } from '../store/i18n/store';

const BootstrapperContextProvider: FC<{
	i18nFactory: I18nFactory;
	children: React.ReactNode;
}> = ({ children, i18nFactory }) => {
	const i18n = useI18nStore((s) => s.instances[SHELL_APP_ID]);
	return (
		<BootstrapperContext.Provider
			value={{
				i18nFactory
			}}
		>
			<I18nextProvider i18n={i18n}>
				<BoardContextProvider>{children}</BoardContextProvider>
			</I18nextProvider>
		</BootstrapperContext.Provider>
	);
};
export default BootstrapperContextProvider;
