/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { usePrimaryBarState } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import OperationsDetailPanel from './operations/operations-detail-panel';
import OperationsListPanel from './operations/operations-list-panel';

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const detailViewMaxWidth = isPrimaryBarExpanded ? 981 : 1125;

  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Routes>
        <Route
          path="/*"
          element={
            <Container orientation="horizontal" mainAlignment="flex-start">
              <Container style={{ maxWidth: '16.563rem' }}>
                <Suspense fallback={<spinner-wc />}>
                  <OperationsListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container
                  style={{ maxWidth: `${detailViewMaxWidth}px`, transition: 'max-width 300ms' }}
                >
                  <Suspense fallback={<spinner-wc />}>
                    <OperationsDetailPanel />
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
