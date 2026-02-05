/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import BreadCrumb from './breadcrumb/breadcrumb-view';
import DomainDetailPanel from './domain/domain-detail-panel';
import DomainListPanel from './domain/domain-list-panel';

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
      <BreadCrumb />
      <Routes>
        <Route
          path="*"
          element={
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              height="calc(100vh - 105px)"
            >
              <Container style={{ maxWidth: '265px' }}>
                <Suspense fallback={<spinner-wc />}>
                  <DomainListPanel />
                </Suspense>
              </Container>
              <Container style={{ maxWidth: '100%' }}>
                <Container style={getContainerStyle(isPrimaryBarExpanded)}>
                  <Suspense fallback={<spinner-wc />}>
                    <DomainDetailPanel />
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
