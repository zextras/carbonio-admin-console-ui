/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { FC } from 'react';
import { Route, Routes } from 'react-router';

import MTADetailOperationPanel from './mta-detail-operation-panel';

export const MTADetailPanel: FC = () => (
  <Container
    orientation="column"
    crossAlignment="center"
    mainAlignment="flex-start"
    style={{ overflowY: 'hidden' }}
    background="gray6"
  >
    <Routes>
      <Route path={'/:operation'} element={<MTADetailOperationPanel />} />
      <Route path={'/:server/:operation'} element={<MTADetailOperationPanel />} />
    </Routes>
  </Container>
);
