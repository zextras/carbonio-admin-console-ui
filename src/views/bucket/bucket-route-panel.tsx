/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { Container, Padding, Text, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import logo from '../../assets/ninja_robo.svg';
import ServersDetailPanel from './global-servers/server-detail-panel';
// import DomainOperations from './domain-detail-operation';
import { CREATE_NEW_DOMAIN_ROUTE_ID, SERVERS_LIST } from '../../constants';

import CreateDomain from '../domain/create-new-domain';
import BucketOperation from './bucket-detail-operation';
// import CreateDomain from './create-new-domain';

const BucketRoutePanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();

	const createNewDomain = (): void => {
		replaceHistory(`/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
	};

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
