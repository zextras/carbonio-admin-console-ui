/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { LEGAL_HOLD_ROUTE_ID, SERVICES_ROUTE_ID } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import LegalHoldPanel from './legal-hold/legal-hold-panel';

const AppView: FC = () => {
	return (
		<Container height={'fit'}>
			<BreadCrumb />
			<Routes>
				<Route
					path={`/${SERVICES_ROUTE_ID}/${LEGAL_HOLD_ROUTE_ID}`}
					element={
						<Container
							orientation="horizontal"
							mainAlignment="flex-start"
							style={{ overflow: 'hidden' }}
						>
							<Container style={{ maxWidth: '100%' }}>
								<Suspense fallback={<spinner-wc />}>
									<LegalHoldPanel />
								</Suspense>
							</Container>
						</Container>
					}
				/>
			</Routes>
		</Container>
	);
};

export default AppView;
