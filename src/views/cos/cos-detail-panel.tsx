/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import CosOperations from './cos-detail-operation';
import CosList from './cos-list';
import CreateCos from './create-new-cos';
import { CREATE_NEW_COS_ROUTE_ID } from '../../constants';

const CosDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { path } = useRouteMatch();

	return (
		<>
			<Container
				orientation="column"
				crossAlignment="center"
				mainAlignment="flex-start"
				style={{ overflowY: 'hidden' }}
				background="gray6"
			>
				<Switch>
					<Route exact path={`${path}/:cosId/:operation`}>
						<CosOperations />
					</Route>
					<Route exact path={`${path}/${CREATE_NEW_COS_ROUTE_ID}`}>
						<CreateCos />
					</Route>
					<Route exact path={`${path}/cos_list`}>
						<CosList />
					</Route>
				</Switch>
			</Container>
		</>
	);
};

export default CosDetailPanel;
