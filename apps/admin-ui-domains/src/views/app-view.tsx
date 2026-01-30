/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route } from 'react-router-dom';

import { DOMAINS_ROUTE_ID, MANAGE_APP_ID } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import DomainDetailPanel from './domain/domain-detail-panel';
import DomainListPanel from './domain/domain-list-panel';

function getContainerMaxWidth(isPrimaryBarExpanded: boolean): {
  maxWidth: string;
  transition: string;
} {
  return {
    maxWidth: isPrimaryBarExpanded ? '981px' : '1125px',
    transition: 'width 300ms',
  };
}

const AppView: FC = () => {
  const isPrimaryBarExpanded = usePrimaryBarState();
  const containerStyle = getContainerMaxWidth(isPrimaryBarExpanded);

  return (
    <Container height={'fit'}>
      <BreadCrumb />
      <Route path={`/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`}>
        <Container orientation="horizontal" mainAlignment="flex-start" height="calc(100vh - 105px)">
          <Container style={{ maxWidth: '265px' }}>
            <Suspense fallback={<spinner-wc />}>
              <DomainListPanel />
            </Suspense>
          </Container>
          <Container style={containerStyle}>
            <Suspense fallback={<spinner-wc />}>
              <DomainDetailPanel />
            </Suspense>
          </Container>
        </Container>
      </Route>
    </Container>
  );
};

export default AppView;
