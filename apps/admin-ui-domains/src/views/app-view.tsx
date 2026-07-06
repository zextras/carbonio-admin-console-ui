/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { usePrimaryBarState } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import DomainListPanel from './domain/domain-list-panel';
import { DomainContentPanel } from './domain-content-panel';

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
      <Breadcrumb />
      <Container orientation="horizontal" mainAlignment="flex-start" height="calc(100vh - 105px)">
        <Container style={{ maxWidth: '265px' }}>
          <Suspense fallback={<ds-spinner />}>
            <DomainListPanel />
          </Suspense>
        </Container>
        <Container style={{ maxWidth: '100%' }}>
          <Container style={getContainerStyle(isPrimaryBarExpanded)}>
            <DomainContentPanel />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default AppView;
