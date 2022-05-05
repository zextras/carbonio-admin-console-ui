/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense } from 'react';
import { Container, Text } from '@zextras/carbonio-design-system';
import { Spinner } from '@zextras/carbonio-shell-ui';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import DomainListPanel from './domain/domain-list-panel';
import DomainDetailPanel from './domain/domain-detail-panel';

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
			<Route path={`${path}/server-and-volumes`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>Server and Volumes</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/certificate-item`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>Certificate Sidebar</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/cos`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>COS</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/core`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>Core</Text>
					</Container>
					<Suspense fallback={<Spinner />}>
						<DomainDetailPanel />
					</Suspense>
				</Container>
			</Route>
			<Route path={`${path}/features`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<Container width="40%">
						<Text>Features</Text>
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
