/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/ui-shared';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import { Breadcrumb } from './breadcrumb/breadcrumb';

function getContainerStyle(isPrimaryBarExpanded: boolean) {
  return {
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  return (
    <Container height={'fit'}>
      <Breadcrumb />
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
                <Suspense fallback={<spinner-wc></spinner-wc>}>
                  <BackupListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={getContainerStyle(isPrimaryBarExpanded)}>
                  <Suspense fallback={<spinner-wc></spinner-wc>}>
                    <BackupDetailPanel />
                  </Suspense>
                </Container>
              </Container>
            </Container>
          }
        />
      </Routes>
    </Container>
  );
};

export default AppView;
