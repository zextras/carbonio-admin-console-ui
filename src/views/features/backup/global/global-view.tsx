/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Route, Switch as RouterSwitch, Redirect } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { ShellBody, ColumnLeft, ColumnFull } from './column-view';
import { SidebarNavigation } from './sidebar-navigation';

const GlobalView: FC = () => {
	const [t] = useTranslation();

	const navigationLinks = [
		{
			label: t('label.service_status', 'Service Status'),
			icon: 'ActivityOutline',
			url: '/services/backup/service_status'
		},
		{
			label: t('label.server_config', 'Server Config'),
			icon: 'HardDriveOutline',
			url: '/services/backup/server_config'
		},
		{
			label: t('label.advanced', 'Advanced'),
			icon: 'LogInOutline',
			url: '/services/backup/advanced'
		}
	];

	return (
		<ShellBody>
			<SidebarNavigation links={navigationLinks} />
			<ColumnFull mainAlignment="space-between" takeAvailableSpace>
				<ColumnLeft width="100%" padding={{ top: 'medium' }}>
					<RouterSwitch>
						<Route exact path="/services/backup">
							<Redirect to="/services/backup/service_status" />
						</Route>
						<Route path="/services/backup/service_status">
							{t('label.service_status', 'Service Status')}
						</Route>
						<Route path="/services/backup/server_config">
							{t('label.server_config', 'Server Config')}
						</Route>
						<Route path="/services/backup/advanced">{t('label.advanced', 'Advanced')}</Route>
					</RouterSwitch>
				</ColumnLeft>
			</ColumnFull>
		</ShellBody>
	);
};

export default GlobalView;
