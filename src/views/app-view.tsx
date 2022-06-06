/* eslint-disable import/no-named-as-default */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense } from 'react';
import { Container, Text } from '@zextras/carbonio-design-system';
import { Spinner } from '@zextras/carbonio-shell-ui';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DomainListPanel from './domain/domain-list-panel';
import DomainDetailPanel from './domain/domain-detail-panel';
import BucketHeader from './bucket/bucket-header';
import BucketDetailPanel from './bucket/bucket-detail-panel';
import BucketListPanel from './bucket/bucket-list-panel';
import {
	BACKUP_ROUTE_ID,
	BUCKET_ROUTE_ID,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	MANAGE_APP_ID,
	MONITORING,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from '../constants';
import Subscription from './core/subscribsion/subscription';
import Dashboard from './components/dashboard/dashboard-view';
import MonitoringView from './components/monitoring/monitoring-view';
import BreadCrumb from './components/breadcrumb/breadcrumb-view';
import BackupApp from './features/backup/BackupApp';

const AppView: FC = () => {
	const { path } = useRouteMatch();
	const [t] = useTranslation();
	return (
		<Container>
			<BreadCrumb />
			<Switch>
				<Route path={`/${DASHBOARD}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Suspense fallback={<Spinner />}>
							<Dashboard />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${MONITORING}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Suspense fallback={<Spinner />}>
							<MonitoringView />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						height="calc(100vh - 105px)"
					>
						<Container width="30%" style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<DomainListPanel />
							</Suspense>
						</Container>
						<Suspense fallback={<Spinner />}>
							<DomainDetailPanel />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${BUCKET_ROUTE_ID}`}>
					<BucketHeader />
					<Container
						width="100%"
						orientation="horizontal"
						mainAlignment="flex-start"
						background="gray5"
						padding={{ all: 'large' }}
					>
						<Suspense fallback={<Spinner />}>
							<BucketListPanel />
						</Suspense>
						<Suspense fallback={<Spinner />}>
							<BucketDetailPanel />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${STORAGES_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Container width="40%">
							<Text>{t('label.storages', 'Storages')}</Text>
						</Container>
						<Suspense fallback={<Spinner />}>
							<BucketListPanel />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Suspense fallback={<Spinner />}>
							<Subscription />
						</Suspense>
					</Container>
				</Route>
				<Route path={`/${SERVICES_ROUTE_ID}/${BACKUP_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Suspense fallback={<Spinner />}>
							<BackupApp />
						</Suspense>
					</Container>
				</Route>
			</Switch>
		</Container>
	);
};

export default AppView;
