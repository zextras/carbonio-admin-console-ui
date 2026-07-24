/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Navigate, Route, Routes } from 'react-router';

import { COS_LIST, CREATE_NEW_COS_ROUTE_ID } from '../../constants';
import { CosList } from './cos-list/cos-list';
import { SECTION_ROUTES } from './cos-section-routes';
import { CreateCos } from './create-new-cos';

export const CosDetailPanel = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    background="gray6"
  >
    <Routes>
      <Route index element={<Navigate to={COS_LIST} replace />} />
      {SECTION_ROUTES.map(({ id, prefix, Component }) => (
        <Route key={id} path={`${prefix}/${id}`} element={<Component />} />
      ))}
      <Route path={CREATE_NEW_COS_ROUTE_ID} element={<CreateCos />} />
      <Route path={COS_LIST} element={<CosList />} />
    </Routes>
  </Container>
);
