/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';

import { Container, useSnackbar, Button } from '@zextras/carbonio-design-system';
import { pushHistory } from '@zextras/admin-ui-bootstrapper';
import { useTranslation } from 'react-i18next';

import { SECONDARY_ROUTE } from '../../constants';

const SecondaryRouteIconView: FC = () => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	return (
		<Container>
			<Button
				type="ghost"
				color={'text'}
				icon="Activity"
				onClick={(): void => {
					createSnackbar({
						key: 'snackbar',
						replace: true,
						severity: 'info',
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
