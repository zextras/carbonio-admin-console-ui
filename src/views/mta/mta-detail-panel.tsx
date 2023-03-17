/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import MTADetailOperationPanel from './mta-detail-operation-panel';

const MTADetailPanel: FC = () => {
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
					<MTADetailOperationPanel />
				</Route>
			</Switch>
		</Container>
	);
};

export default MTADetailPanel;
