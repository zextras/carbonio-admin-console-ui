/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { FC, Suspense } from 'react';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import PrivacyView from './privacy/privacy-view';

const AppView: FC = () => {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Container orientation="horizontal" mainAlignment="flex-start">
        <Container style={{ maxWidth: '100%' }}>
          <Container style={{ maxWidth: detailViewMaxWidth, transition: 'width 300ms' }}>
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
