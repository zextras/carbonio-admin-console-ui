/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Route, Routes } from 'react-router';

import { CREATE_NEW_COS_ROUTE_ID } from '../../constants';
import CosOperations from './cos-detail-operation';
import CosList from './cos-list';
import CreateCos from './create-new-cos';

export const CosDetailPanel = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    style={{ overflowY: 'hidden' }}
    background="gray6"
  >
    <Routes>
      <Route path={'/:cosId/:operation'} element={<CosOperations />} />
      <Route path={`/${CREATE_NEW_COS_ROUTE_ID}`} element={<CreateCos />} />
      <Route path={'/cos_list'} element={<CosList />} />
    </Routes>
  </Container>
);
