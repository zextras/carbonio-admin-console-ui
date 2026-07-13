/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Outlet } from 'react-router';

import BucketListPanel from './bucket/bucket-list-panel';

export const StorageLayout = () => (
  <Container orientation="horizontal" mainAlignment="flex-start">
    <Container style={{ maxWidth: '265px' }}>
      <BucketListPanel />
    </Container>
    <Container style={{ maxWidth: '100%' }}>
      <Container
        orientation="column"
        crossAlignment="center"
        mainAlignment="flex-start"
        style={{ overflowY: 'hidden' }}
        background="gray6"
      >
        <Outlet />
      </Container>
    </Container>
  </Container>
);
