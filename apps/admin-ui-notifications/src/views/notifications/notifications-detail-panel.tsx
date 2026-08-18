/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { Navigate, Route, Routes } from 'react-router';

import { LIST } from '../../constants';
import { NotificationListView } from './notification-list-view';

export const NotificationsDetailPanel = () => {
  return (
    <Container
      orientation="column"
      crossAlignment="center"
      mainAlignment="flex-start"
      style={{ overflowY: 'hidden' }}
      background="gray6"
    >
      <Routes>
        <Route index element={<Navigate to={LIST} replace />} />
        <Route path={LIST} element={<NotificationListView />} />
        <Route path="*" element={null} />
      </Routes>
    </Container>
  );
};
