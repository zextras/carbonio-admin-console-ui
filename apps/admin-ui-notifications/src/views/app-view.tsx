/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container,PageHeader } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { NotificationsDetailPanel } from './notifications/notifications-detail-panel';
import { NotificationsListPanel } from './notifications/notifications-list-panel';

export const AppView = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  return (
    <Container height={'fit'}>
      <PageHeader />
      <Routes>
        <Route
          path="/*"
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<ds-spinner />}>
                  <NotificationsListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
                  <Suspense fallback={<ds-spinner />}>
                    <NotificationsDetailPanel />
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
