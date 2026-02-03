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

import BreadCrumb from './breadcrumb/breadcrumb-view';
import { MTADetailPanel } from './mta/mta-detail-panel';
import MTAListPanel from './mta/mta-list-panel';

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
          path={'/*'}
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '16.563rem' }}>
                <Suspense fallback={<spinner-wc />}>
                  <MTAListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
                  <Suspense fallback={<spinner-wc />}>
                    <MTADetailPanel />
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
