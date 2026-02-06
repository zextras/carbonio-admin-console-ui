/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { BreadcrumbWrapper } from './breadcrumb/breadcrumb-wrapper';
import { CosDetailPanel } from './cos/cos-detail-panel';
import { CosListPanel } from './cos/cos-list-panel';

function getContainerStyle(isPrimaryBarExpanded: boolean) {
  return {
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  return (
    <Container>
      <BreadcrumbWrapper />
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
                <Container style={getContainerStyle(isPrimaryBarExpanded)}>
                  <Suspense fallback={<spinner-wc />}>
                    <CosDetailPanel />
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
