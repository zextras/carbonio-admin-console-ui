/* eslint-disable import/no-named-as-default */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useState } from 'react';
import { Container, Breadcrumbs, Text } from '@zextras/carbonio-design-system';
import { Spinner, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
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
			<Route path={`${path}/${BUCKET_ROUTE_ID}`}>
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
			<Route path={`${path}/${STORAGES_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>{t('label.storages', 'Storages')}</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<BucketListPanel />
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
