/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext } from 'react';

import { ModalManagerContext, useSnackbar } from '@zextras/carbonio-design-system';
import { BrowserRouter, useHistory } from 'react-router-dom';

import { BASENAME } from '../constants';
import AppLoaderMounter from './app/app-loader-mounter';
import ShellView from '../shell/shell-view';
import { useBridge } from '../store/context-bridge';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const ContextBridge: FC = () => {
	const history = useHistory();
	const createSnackbar = useSnackbar();
	// eslint-disable-next-line @typescript-eslint/ban-types
	const createModal = useContext(ModalManagerContext) as Function;
	useBridge({
		functions: {
			getHistory: () => history,
			createSnackbar,
			createModal
		}
	});
	return null;
};

const BootstrapperRouter: FC = () => (
	<BrowserRouter basename={BASENAME}>
		<ContextBridge />
		<AppLoaderMounter />
		<ShellView />
	</BrowserRouter>
);

export default BootstrapperRouter;
