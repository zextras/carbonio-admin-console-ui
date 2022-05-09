/* eslint-disable import/no-named-as-default */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useState } from 'react';
import { Container, Breadcrumbs } from '@zextras/carbonio-design-system';
import { Spinner, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import DomainListPanel from './domain/domain-list-panel';
import DomainDetailPanel from './domain/domain-detail-panel';
import BucketHeader from './bucket/bucket-header';
import BucketDetailPanel from './bucket/bucket-detail-panel';
import BucketListPanel from './bucket/bucket-list-panel';

const AppView: FC = () => {
	const { path } = useRouteMatch();

	return (
		<Switch>
			<Route path={`${path}/domain`}>
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
			<Route path={`${path}/buckets`}>
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
		</Switch>
	);
};

export default AppView;
