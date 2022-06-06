/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, lazy, Suspense, useEffect, useMemo } from 'react';
import { addRoute, registerActions, setAppContext, Spinner } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
	APP_ID,
	BACKUP_ROUTE_ID,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	MANAGE,
	MANAGE_APP_ID,
	MONITORING,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from './constants';
import BackupTooltipView from './views/tooltip-view/backup-tooltip-view';
import DomainTooltipView from './views/tooltip-view/domain-tooltip-view';
import StorageTooltipView from './views/tooltip-view/storage-tooltip-view';
import SubscriptionTooltipView from './views/tooltip-view/subscription-tooltip-view';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);
	const servicesSection = useMemo(
		() => ({
			id: SERVICES_ROUTE_ID,
			label: t('label.services', 'Services'),
			position: 4
		}),
		[t]
	);

	useEffect(() => {
		addRoute({
			route: DASHBOARD,
			position: 1,
			visible: true,
			label: t('label.dashboard', 'Dashboard'),
			primaryBar: 'HomeOutline',
			appView: AppView
		});
		addRoute({
			route: MONITORING,
			position: 2,
			visible: true,
			label: t('label.monitoring', 'Monitoring'),
			primaryBar: 'ActivityOutline',
			appView: AppView
		});

		addRoute({
			route: DOMAINS_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.domains', 'Domains'),
			primaryBar: 'AtOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: DomainTooltipView
		});
		addRoute({
			route: STORAGES_ROUTE_ID,
			position: 2,
			visible: true,
			label: t('label.storages', 'Storages'),
			primaryBar: 'HardDriveOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: StorageTooltipView
		});
		addRoute({
			route: SUBSCRIPTIONS_ROUTE_ID,
			position: 3,
			visible: true,
			label: t('label.subscriptions', 'Subscriptions'),
			primaryBar: 'AwardOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: SubscriptionTooltipView
		});
		addRoute({
			route: BACKUP_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.backup', 'Backup'),
			primaryBar: 'RefreshOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...servicesSection },
			tooltip: BackupTooltipView
		});

		setAppContext({ hello: 'world' });
	}, [t, managementSection, servicesSection]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-domain',
				label: t('label.new_domain', 'New Domain'),
				icon: '',
				click: (ev: any): void => {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
				},
				disabled: false,
				group: APP_ID,
				primary: false
			}),
			id: 'new-domain',
			type: 'new'
		});
	}, [t, history]);

	return null;
};

export default App;
