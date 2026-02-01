/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import BucketOperation from './bucket-detail-operation';

const BucketRoutePanel: FC = () => {
  const location = useLocation();
  const path = location.pathname;
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      <Routes>
        <Route path={`${path}/:operation`} element={<BucketOperation />} />
        <Route path={`${path}/:server/:operation`} element={<BucketOperation />} />
      </Routes>
    </Container>
  );
};
export default BucketRoutePanel;
