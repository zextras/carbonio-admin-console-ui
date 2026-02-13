/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/ui-shared';
import { Container, ContainerProps } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import styled from 'styled-components';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import BreadCrumb from './breadcrumb/breadcrumb-view';

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
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              style={{ overflow: 'hidden' }}
            >
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<spinner-wc />}>
                  <BackupListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <DetailViewContainer isPrimaryBarExpanded={isPrimaryBarExpanded}>
                  <Suspense fallback={<spinner-wc />}>
                    <BackupDetailPanel />
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
