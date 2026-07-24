/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BreadcrumbComponent, Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { MTADetailPanel } from './mta/mta-detail-panel';
import MTAListPanel from './mta/mta-list-panel';

export const AppView: FC = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  return (
    <Container height={'fit'}>
      <BreadcrumbComponent />
      <Routes>
        <Route
          path={'/*'}
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '16.563rem' }}>
                <Suspense fallback={<ds-spinner />}>
                  <MTAListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container
                  style={{ maxWidth: detailViewMaxWidth, transition: 'max-width 300ms' }}
                >
                  <Suspense fallback={<ds-spinner />}>
                    <MTADetailPanel />
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

