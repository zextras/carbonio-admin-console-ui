/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container, ContainerProps } from '@zextras/carbonio-design-system';
import { FC, Suspense } from 'react';
import { Route } from 'react-router-dom';
import styled from 'styled-components';

import { DOMAINS_ROUTE_ID, MANAGE_APP_ID } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import { Spinner } from './components/spinner';
import DomainDetailPanel from './domain/domain-detail-panel';
import DomainListPanel from './domain/domain-list-panel';

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
			<Route path={`/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`}>
				<Container orientation="horizontal" mainAlignment="flex-start" height="calc(100vh - 105px)">
					<Container style={{ maxWidth: '265px' }}>
						<Suspense fallback={<Spinner />}>
							<DomainListPanel />
						</Suspense>
					</Container>
					<Container style={{ maxWidth: '100%' }}>
						<DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
							<Suspense fallback={<Spinner />}>
								<DomainDetailPanel />
							</Suspense>
						</DetailViewContainer>
					</Container>
				</Container>
			</Route>
		</Container>
	);
};

export default AppView;
