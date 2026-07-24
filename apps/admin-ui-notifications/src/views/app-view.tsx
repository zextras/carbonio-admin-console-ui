/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import NotificationsDetailPanel from './notifications/notifications-detail-panel';
import NotificationsListPanel from './notifications/notifications-list-panel';

export const AppView: FC = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  return (
    <Container height={'fit'}>
      <Breadcrumbs />
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
