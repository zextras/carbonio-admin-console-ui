/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Breadcrumbs, Container } from '@zextras/ui-components';
import { Navigate, Route, Routes } from 'react-router';

import { SERVERS_LIST } from '../constants';
import { StorageLayout } from './storage-layout';
import { SECTION_ROUTES } from './storage-section-routes';

export const AppView = () => {
  return (
    <Container>
      <Breadcrumbs />
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
