/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import React, { FC, Suspense } from 'react';
import { Route } from 'react-router-dom';

import { MANAGE_APP_ID, STORAGES_ROUTE_ID } from '../constants';

import BreadCrumb from './breadcrumb/breadcrumb-view';
import BucketListPanel from './bucket/bucket-list-panel';
import BucketRoutePanel from './bucket/bucket-route-panel';
import { Spinner } from './components/spinner';

const AppView: FC = () => {
	return (
		<Container height={'fit'}>
			<BreadCrumb />
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
		</Container>
	);
};

export default AppView;
