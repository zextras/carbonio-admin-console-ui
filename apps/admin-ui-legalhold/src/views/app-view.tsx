/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, PageHeader } from '@zextras/ui-components';
import { Suspense } from 'react';

import { LegalHoldPanel } from './legal-hold/legal-hold-panel';

export const AppView = () => {
  return (
    <Container height="fit">
      <PageHeader />
      <Container
        orientation="horizontal"
        mainAlignment="flex-start"
        style={{ overflow: 'hidden' }}
      >
        <Container style={{ maxWidth: '100%' }}>
          <Suspense fallback={<ds-spinner />}>
            <LegalHoldPanel />
          </Suspense>
        </Container>
      </Container>
    </Container>
  );
};
