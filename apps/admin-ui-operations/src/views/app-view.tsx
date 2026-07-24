/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { RUNNING_ROUTE_ID } from '../constants';
import OperationsLayout from './operations/operations-layout';
import { SECTION_ROUTES } from './operations/operations-section-routes';

export const AppView: FC = () => {
	return (
		<Container height={'fit'}>
			<Breadcrumbs />
			<Routes>
				<Route index element={<Navigate to={RUNNING_ROUTE_ID} replace />} />
				<Route element={<OperationsLayout />}>
					{SECTION_ROUTES.map(({ id, Component }) => (
						<Route key={id} path={id} element={<Component />} />
					))}
					<Route path="*" element={<Navigate to={RUNNING_ROUTE_ID} replace />} />
				</Route>
			</Routes>
		</Container>
	);
};

