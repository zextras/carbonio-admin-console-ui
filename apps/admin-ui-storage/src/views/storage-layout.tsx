/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/ui-components';
import { Outlet } from 'react-router';

import { StorageSidebar } from './bucket/storage-sidebar';

export const StorageLayout = () => {
  return (
    <Container orientation="horizontal" mainAlignment="flex-start">
      <Container style={{ maxWidth: '265px' }}>
        <StorageSidebar />
      </Container>
      <Container style={{ maxWidth: '100%' }}>
        <Container
          orientation="column"
          crossAlignment="center"
          mainAlignment="flex-start"
          style={{ transition: 'width 300ms', overflowY: 'hidden' }}
          background="gray6"
        >
          <Outlet />
        </Container>
      </Container>
    </Container>
  );
};
