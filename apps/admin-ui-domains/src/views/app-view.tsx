/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';
import { useLocation } from 'react-router';

import { CREATE_NEW_DOMAIN_ROUTE_ID } from '../constants';
import { DomainContentPanel } from './domain-content-panel';
import { DomainPageHeader } from './domain-page-header';
import { DomainSidebar } from './sidebar/domain-sidebar';

export const AppView: FC = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  const { pathname } = useLocation();
  const isCreateNewDomain = pathname.includes(CREATE_NEW_DOMAIN_ROUTE_ID);

  return (
    <Container>
      <DomainPageHeader />
      <Container orientation="horizontal" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
        {!isCreateNewDomain && (
          <Container style={{ maxWidth: '265px' }}>
            <Suspense fallback={<ds-spinner />}>
              <DomainSidebar />
            </Suspense>
          </Container>
        )}
        <Container style={{ maxWidth: '100%' }}>
          <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
            <DomainContentPanel />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};
