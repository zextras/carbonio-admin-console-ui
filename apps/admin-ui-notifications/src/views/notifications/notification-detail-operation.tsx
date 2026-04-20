/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FC, ReactNode } from 'react';
import { useParams } from 'react-router';

import { LIST } from '../../constants';
import NotificationListView from './notification-list-view';

const NotificationDetailOperation: FC = () => {
  const { operation } = useParams();
  return (
    <>
      {((): ReactNode => {
        switch (operation) {
          case LIST:
            return <NotificationListView />;
          default:
            return null;
        }
      })()}
    </>
  );
};

export default NotificationDetailOperation;
