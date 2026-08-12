/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, type CrumbMenuItem,PageHeader } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import { RUNNING_ROUTE_ID } from '../constants';
import { OperationsLayout } from './operations/operations-layout';
import { SECTION_ROUTES } from './operations/operations-section-routes';

export const AppView = () => {
	const [t] = useTranslation();
	const { pathname } = useLocation();
	const appBase = `/${pathname.split('/').filter(Boolean).slice(0, 2).join('/')}`;
	const sections: Array<CrumbMenuItem> = SECTION_ROUTES.filter((r) => !r.prefix).map(
		({ id, labelKey, labelDefault }) => ({
			path: `${appBase}/${id}`,
			label: t(labelKey, labelDefault),
		}),
	);
	const crumbMenus = sections.some((s) => s.path === pathname)
		? { [pathname]: sections }
		: undefined;
	return (
		<Container height={'fit'}>
			<PageHeader crumbMenus={crumbMenus} />
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

