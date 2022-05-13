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
import {
	BACKUP_ROUTE_ID,
	DOMAINS_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from '../constants';
import Subscription from './core/subscribsion/subscription';

const AppView: FC = () => {
	const { path } = useRouteMatch();
	const [t] = useTranslation();
	return (
		<Switch>
			<Route path={`${path}/${DOMAINS_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Suspense fallback={<Spinner />}>
							<DomainListPanel />
						</Suspense>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/${STORAGES_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>{t('label.storages', 'Storages')}</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/${SUBSCRIPTIONS_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Suspense fallback={<Spinner />}>
						<Subscription />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/${BACKUP_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>{t('label.backup', 'Backup')}</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
		</Switch>
	);
};

export default AppView;
