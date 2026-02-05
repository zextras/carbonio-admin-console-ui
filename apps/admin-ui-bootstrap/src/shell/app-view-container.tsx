/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { find, map } from 'lodash-es';
import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import AppContextProvider from '../boot/app/app-context-provider';
import { useAppList, useAppStore, useRoutes } from '../store/app';

const FirstAppRedirect = () => {
  const apps = useAppList();
  const routes = useRoutes();
  const location = useLocation();
  const mainRoute = useMemo(
    () => find(routes, (r) => apps[0]?.name === r.app)?.route,
    [apps, routes],
  );
  return mainRoute && location?.pathname === '/' ? <Navigate to={`/${mainRoute}`} replace /> : null;
};

export default function AppViewContainer() {
  const appViews = useAppStore((s) => s.views.appView);
  const routes = useMemo(
    () => [
      ...map(appViews, (view) => (
        <Route
          key={view.id}
          path={`/${view.route}/*`}
          element={
            <AppContextProvider key={view.app} pkg={view.app}>
              <view.component />
            </AppContextProvider>
          }
        />
      )),
    ],
    [appViews],
  );

  return (
    <Container
      style={{
        flexGrow: 1,
        flexBasis: 0,
        minWidth: '1px',
        maxHeight: 'calc(100vh - 60px)',
        overflowY: 'auto',
      }}
    >
      <Container mainAlignment="flex-start">
        <Routes>{routes}</Routes>
        <FirstAppRedirect />
      </Container>
    </Container>
  );
}
