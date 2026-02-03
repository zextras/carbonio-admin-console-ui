/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { CREATE_NEW_COS_ROUTE_ID } from '../../constants';
import CosOperations from './cos-detail-operation';
import CosList from './cos-list';
import CreateCos from './create-new-cos';

export const CosDetailPanel: FC = () => {
	const location = useLocation();
	const path = location.pathname;

	return (
		<Container
			orientation="column"
			crossAlignment="center"
			mainAlignment="flex-start"
			style={{ overflowY: 'hidden' }}
			background="gray6"
		>
			<Routes>
				<Route path={`${path}/:cosId/:operation`} element={<CosOperations />} />
				<Route path={`${path}/${CREATE_NEW_COS_ROUTE_ID}`} element={<CreateCos />} />
				<Route path={`${path}/cos_list`} element={<CosList />} />
			</Routes>
		</Container>
	);
};
