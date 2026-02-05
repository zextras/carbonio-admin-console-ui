/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container, ContainerProps } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import styled from 'styled-components';

import { BreadCrumb } from './breadcrumb/breadcrumb-view';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosListPanel } from './cos/cos-list-panel';

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
    <Container>
      <BreadCrumb />
      <Routes>
        <Route
          path={'/*'}
          element={
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              height="calc(100vh - 105px)"
            >
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<spinner-wc />}>
                  <CosListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
                  <Suspense fallback={<spinner-wc />}>
                    <CosDetailPanel />
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
