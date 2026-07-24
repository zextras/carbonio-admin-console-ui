/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container, type CrumbMenuItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import { SERVERS_LIST } from '../constants';
import { StorageLayout } from './storage-layout';
import { SECTION_ROUTES } from './storage-section-routes';

export const AppView = () => {
  const [t] = useTranslation();
  const { pathname } = useLocation();
  const appBase = `/${pathname.split('/').filter(Boolean).slice(0, 2).join('/')}`;
  const sections: Array<CrumbMenuItem> = SECTION_ROUTES.filter((r) => !r.prefix).map(
    ({ id, labelKey, labelDefault }) => ({
      path: `${appBase}/${id}`,
      label: t(labelKey, labelDefault),
    }),
  );
  const crumbMenus = sections.some((s) => s.path === pathname)
    ? { [pathname]: sections }
    : undefined;
  return (
    <Container>
      <Breadcrumbs crumbMenus={crumbMenus} />
      <Routes>
        <Route element={<StorageLayout />}>
          <Route index element={<Navigate to={SERVERS_LIST} replace />} />
          {SECTION_ROUTES.map(({ id, prefix, Component }) => (
            <Route key={id} path={prefix ? `${prefix}/${id}` : id} element={<Component />} />
          ))}
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Container>
  );
};
