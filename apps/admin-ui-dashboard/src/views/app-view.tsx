/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { BreadcrumbWrapper } from './breadcrumb/breadcrumb-wrapper';
import Dashboard from './dashboard/dashboard-view';

const DashboardComponent = () => (
  <Container orientation="horizontal" mainAlignment="flex-start" background="gray5" height="auto">
    <Suspense fallback={<spinner-wc />}>
      <Dashboard />
    </Suspense>
  </Container>
);

const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <BreadcrumbWrapper />
      <Routes>
        <Route path={'/*'} element={<DashboardComponent />} />
      </Routes>
    </Container>
  );
};

export default AppView;
