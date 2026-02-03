/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { DASHBOARD } from '../constants';
import BreadCrumb from './breadcrumb/breadcrumb-view';
import Dashboard from './dashboard/dashboard-view';

const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <BreadCrumb />
      <Routes>
        <Route
          path={`/${DASHBOARD}`}
          element={
            <Container
              orientation="horizontal"
              mainAlignment="flex-start"
              background="gray5"
              height="auto"
            >
              <Suspense fallback={<spinner-wc />}>
                <Dashboard />
              </Suspense>
            </Container>
          }
        />
      </Routes>
    </Container>
  );
};

export default AppView;
