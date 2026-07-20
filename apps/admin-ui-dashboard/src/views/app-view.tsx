/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import Dashboard from './dashboard/dashboard-view';

const DashboardComponent = () => (
  <Container orientation="horizontal" mainAlignment="flex-start" background="gray5" height="auto">
    <Suspense fallback={<ds-spinner />}>
      <Dashboard />
    </Suspense>
  </Container>
);

export const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <DashboardComponent />
    </Container>
  );
};

