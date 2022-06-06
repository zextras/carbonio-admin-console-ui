/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import {
	Container,
	ModalManager,
	ThemeProvider,
	SnackbarManager
} from '@zextras/carbonio-design-system';

import Backup from './index';

const BackupApp: FC = () => (
	<ThemeProvider>
		<SnackbarManager>
			<ModalManager>
				<Container
					width={process.env.NODE_ENV === 'development' ? '100%' : 'calc(100vw - 264px)'}
					height={
						process.env.NODE_ENV === 'development' ? 'calc(100vh - 16px)' : 'calc(100vh - 108px)'
					}
					mainAlignment="flex-start"
					style={{ minHeight: '300px' }}
				>
					<Backup />
				</Container>
			</ModalManager>
		</SnackbarManager>
	</ThemeProvider>
);
export default BackupApp;
