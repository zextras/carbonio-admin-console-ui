/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import BreadCrumb from './breadcrumb/breadcrumb-view';
import { MTADetailPanel } from './mta/mta-detail-panel';
import MTAListPanel from './mta/mta-list-panel';

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const detailViewMaxWidth = isPrimaryBarExpanded ? 981 : 1125;
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
                <Container
                  style={{ maxWidth: `${detailViewMaxWidth}px`, transition: 'max-width 300ms' }}
                >
                  <Suspense fallback={<spinner-wc />}>
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

export default AppView;
