/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { Breadcrumb } from './breadcrumb/breadcrumb';
import BucketListPanel from './bucket/bucket-list-panel';
import BucketRoutePanel from './bucket/bucket-route-panel';

const BucketComponent = () => (
  <Container orientation="horizontal" mainAlignment="flex-start">
    <Container style={{ maxWidth: '265px' }}>
      <Suspense fallback={<ds-spinner />}>
        <BucketListPanel />
      </Suspense>
    </Container>
    <Container style={{ maxWidth: '100%' }}>
      <Suspense fallback={<ds-spinner />}>
        <BucketRoutePanel />
      </Suspense>
    </Container>
  </Container>
);

const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Routes>
        <Route path={`/*`} element={<BucketComponent />} />
      </Routes>
    </Container>
  );
};

export default AppView;
