/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import BackupDetailPanel from './backup/backup-detail-panel';
import BackupListPanel from './backup/backup-list-panel';
import { Breadcrumb } from './breadcrumb/breadcrumb';

const AppView: FC = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
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
                <Suspense fallback={<ds-spinner></ds-spinner>}>
                  <BackupListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
                  <Suspense fallback={<ds-spinner></ds-spinner>}>
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
