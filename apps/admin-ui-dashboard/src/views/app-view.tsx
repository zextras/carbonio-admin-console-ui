/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import React, { FC, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';

import { DASHBOARD } from '../constants';

import BreadCrumb from './breadcrumb/breadcrumb-view';
import { Spinner } from './components/spinner';
import Dashboard from './dashboard/dashboard-view';

const AppView: FC = () => {
	return (
		<Container height={'fit'}>
			<BreadCrumb />
			<Switch>
				<Route path={`/${DASHBOARD}`}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						background="gray5"
						height="auto"
					>
						<Suspense fallback={<Spinner />}>
							<Dashboard />
						</Suspense>
					</Container>
				</Route>
			</Switch>
		</Container>
	);
};

export default AppView;
