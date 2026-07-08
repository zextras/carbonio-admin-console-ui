/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { usePrimaryBarState } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';

import { Breadcrumb } from './breadcrumb/breadcrumb';
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
      <Breadcrumb />
      <Container orientation="horizontal" mainAlignment="flex-start">
        <Container style={{ maxWidth: '100%' }}>
          <Container style={getContainerStyle(isPrimaryBarExpanded)}>
            <Suspense fallback={<ds-spinner />}>
              <PrivacyView />
            </Suspense>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default AppView;
