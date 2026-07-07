/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../constants';
import { Breadcrumb } from './breadcrumb/breadcrumb';
import DoneDetailPanel from './operations/done-detail-panel';
import OperationsLayout from './operations/operations-layout';
import QuededDetailPanel from './operations/queued-detail-panel';
import RunningDetailPanel from './operations/running-detail-panel';

const AppView: FC = () => {
  return (
    <Container height={'fit'}>
      <Breadcrumb />
      <Routes>
        <Route index element={<Navigate to={RUNNING_ROUTE_ID} replace />} />
        <Route element={<OperationsLayout />}>
          <Route path={RUNNING_ROUTE_ID} element={<RunningDetailPanel />} />
          <Route path={QUEUED_ROUTE_ID} element={<QuededDetailPanel />} />
          <Route path={DONE_ROUTE_ID} element={<DoneDetailPanel />} />
          <Route path="*" element={<Navigate to={RUNNING_ROUTE_ID} replace />} />
        </Route>
      </Routes>
    </Container>
  );
};

export default AppView;
