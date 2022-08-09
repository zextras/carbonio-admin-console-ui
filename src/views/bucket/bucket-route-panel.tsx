/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import BucketOperation from './bucket-detail-operation';

const BucketRoutePanel: FC = () => {
	const { path } = useRouteMatch();

	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			<Switch>
				<Route exact path={`${path}/:operation`}>
					<BucketOperation />
				</Route>
			</Switch>
		</Container>
	);
};
export default BucketRoutePanel;
