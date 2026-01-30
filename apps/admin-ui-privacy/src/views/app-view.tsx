/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrimaryBarState } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route } from 'react-router-dom';

import { MANAGE_APP_ID, PRIVACY_ROUTE_ID } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import PrivacyView from './privacy/privacy-view';

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
      <Route path={`/${MANAGE_APP_ID}/${PRIVACY_ROUTE_ID}`}>
        <Container orientation="horizontal" mainAlignment="flex-start">
          <Container style={{ maxWidth: '100%' }}>
            <Container style={getContainerStyle(isPrimaryBarExpanded)}>
              <Suspense fallback={<spinner-wc />}>
                <PrivacyView />
              </Suspense>
            </Container>
          </Container>
        </Container>
      </Route>
    </Container>
  );
};

export default AppView;
