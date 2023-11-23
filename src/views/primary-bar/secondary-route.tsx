/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext } from 'react';

import { Container, SnackbarManagerContext, IconButton } from '@zextras/carbonio-design-system';
import { pushHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { SECONDARY_ROUTE } from '../../constants';

const SecondaryRouteIconView: FC = () => {
	const createSnackbar = useContext(SnackbarManagerContext) as any;
	const [t] = useTranslation();
	return (
		<Container>
			<IconButton
				icon="Activity"
				onClick={(): void => {
					createSnackbar({
						key: 'snackbar',
						replace: true,
						type: 'info',
						label: t('label.app_clicked', 'You have clicked a button'),
						autoHideTimeout: 1000,
						hideButton: true
					});
					pushHistory({ route: SECONDARY_ROUTE, path: '' });
				}}
			/>
		</Container>
	);
};
export default SecondaryRouteIconView;
