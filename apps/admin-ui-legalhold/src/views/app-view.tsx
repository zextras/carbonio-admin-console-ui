/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BreadcrumbComponent, Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';

import LegalHoldPanel from './legal-hold/legal-hold-panel';

export const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <BreadcrumbComponent />
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

