/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container, ContainerProps } from '@zextras/carbonio-design-system';
import React, { FC, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import {
	BACKUP_ROUTE_ID,
	LEGAL_HOLD_ROUTE_ID,
	LOG_AND_QUEUES,
	MANAGE_APP_ID,
	NOTIFICATION_ROUTE_ID,
	OPERATIONS_ROUTE_ID,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID
} from '../constants';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import BucketListPanel from './bucket/bucket-list-panel';
import BucketRoutePanel from './bucket/bucket-route-panel';
import { Spinner } from './components/spinner';
import LegalHoldPanel from './legal-hold/legal-hold-panel';
import NotificationsDetailPanel from './notifications/notifications-detail-panel';
import NotificationsListPanel from './notifications/notifications-list-panel';
import OperationsDetailPanel from './operations/operations-detail-panel';
import OperationsListPanel from './operations/operations-list-panel';

interface ContainerExtendProps extends ContainerProps {
	isPrimaryBarExpanded?: boolean;
}

const DetailViewContainer = styled(Container)<ContainerExtendProps>`
	max-width: ${({ isPrimaryBarExpanded }): number => (isPrimaryBarExpanded ? 981 : 1125)}px;
	transition: width 300ms;
`;

const AppView: FC = () => {
	const isPrimaryBarExpanded = usePrimaryBarState();
	return (
		<Container height={'fit'}>
			<BreadCrumb />
			<Switch>
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
				<Route path={`/${SERVICES_ROUTE_ID}/${BACKUP_ROUTE_ID}`}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						style={{ overflow: 'hidden' }}
					>
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
				<Route path={`/${SERVICES_ROUTE_ID}/${LEGAL_HOLD_ROUTE_ID}`}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						style={{ overflow: 'hidden' }}
					>
						<Container style={{ maxWidth: '100%' }}>
							<Suspense fallback={<Spinner />}>
								<LegalHoldPanel />
							</Suspense>
						</Container>
					</Container>
				</Route>
				<Route path={`/${LOG_AND_QUEUES}/${NOTIFICATION_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Container style={{ maxWidth: '265px' }}>
							<Suspense fallback={<Spinner />}>
								<NotificationsListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
								<Suspense fallback={<Spinner />}>
									<NotificationsDetailPanel />
								</Suspense>
							</DetailViewContainer>
						</Container>
					</Container>
				</Route>
				<Route path={`/${LOG_AND_QUEUES}/${OPERATIONS_ROUTE_ID}`}>
					<Container orientation="horizontal" mainAlignment="flex-start">
						<Container style={{ maxWidth: '16.563rem' }}>
							<Suspense fallback={<Spinner />}>
								<OperationsListPanel />
							</Suspense>
						</Container>
						<Container style={{ maxWidth: '100%' }}>
							<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
								<Suspense fallback={<Spinner />}>
									<OperationsDetailPanel />
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
