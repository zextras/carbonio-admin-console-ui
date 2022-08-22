/* eslint-disable import/no-named-as-default */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useCallback, useEffect } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import {
	Spinner,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	usePrimaryBarState
} from '@zextras/carbonio-shell-ui';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';
import DomainListPanel from './domain/domain-list-panel';
import DomainDetailPanel from './domain/domain-detail-panel';
import BucketListPanel from './bucket/bucket-list-panel';
import {
	BACKUP_ROUTE_ID,
	COS_ROUTE_ID,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	MANAGE_APP_ID,
	MONITORING,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from '../constants';
import Subscription from './core/subscribsion/subscription';
import Dashboard from './dashboard/dashboard-view';
import MonitoringView from './monitoring/monitoring-view';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import CosListPanel from './cos/cos-list-panel';
import CosDetailPanel from './cos/cos-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import BackupDetailPanel from './backup/backup-detail-panel';
import BucketRoutePanel from './bucket/bucket-route-panel';
import { getAllServers } from '../services/get-all-servers-service';
import { useServerStore } from '../store/server/store';
import { useGlobalConfigStore } from '../store/global-config/store';
import { useBackupModuleStore } from '../store/backup-module/store';

const DetailViewContainer = styled(Container)`
	max-width: ${({ isPrimaryBarExpanded }): number => (isPrimaryBarExpanded ? 981 : 1125)}px;
	transition: width 300ms;
`;

const AppView: FC = () => {
	const isPrimaryBarExpanded = usePrimaryBarState();
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
						<Container style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<DomainListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
								<Suspense fallback={<Spinner />}>
									<DomainDetailPanel />
								</Suspense>
							</DetailViewContainer>
						</Container>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${STORAGES_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Container style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<BucketListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<Suspense fallback={<Spinner />}>
								<BucketRoutePanel />
							</Suspense>
						</Container>
					</Container>
				</Route>
				<Route path={`/${MANAGE_APP_ID}/${COS_ROUTE_ID}`}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						height="calc(100vh - 105px)"
					>
						<Container style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<CosListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
								<Suspense fallback={<Spinner />}>
									<CosDetailPanel />
								</Suspense>
							</DetailViewContainer>
						</Container>
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
						<Container style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<BackupListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
								<Suspense fallback={<Spinner />}>
									<BackupDetailPanel />
								</Suspense>
							</DetailViewContainer>
						</Container>
					</Container>
				</Route>
			</Switch>
		</Container>
	);
};

export default AppView;
