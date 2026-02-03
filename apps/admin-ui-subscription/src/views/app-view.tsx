/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container, ContainerProps } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import { Subscription } from './subscription/subscription';

interface ContainerExtendProps extends ContainerProps {
	isPrimaryBarExpanded?: boolean;
}

const DetailViewContainer = styled(Container)<ContainerExtendProps>`
	max-width: ${({ isPrimaryBarExpanded }): number => (isPrimaryBarExpanded ? 981 : 1125)}px;
	transition: width 300ms;
`;

const AppView: FC = () => {
	const isPrimaryBarExpanded = usePrimaryBarState();
	return (
		<Container height={'fit'}>
			<BreadCrumb />
			<Routes>
				<Route
					path={`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`}
					element={
						<Container orientation="horizontal" mainAlignment="flex-start">
							<Container style={{ maxWidth: '100%' }}>
								<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
									<Suspense fallback={<spinner-wc />}>
										<Subscription />
									</Suspense>
								</DetailViewContainer>
							</Container>
						</Container>
					}
				/>
			</Routes>
		</Container>
	);
};

export default AppView;
