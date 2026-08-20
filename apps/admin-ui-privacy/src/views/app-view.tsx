/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, PageHeader } from '@zextras/ui-components';
import { useDetailViewMaxWidth } from '@zextras/ui-shared';
import { Suspense } from 'react';

import { PrivacyView } from './privacy/privacy-view';

export function AppView() {
  const detailViewMaxWidth = useDetailViewMaxWidth();
  return (
    <Container>
      <PageHeader />
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
}
