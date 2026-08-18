/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useIsAdvanced } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { LOG_AND_QUEUES, NOTIFICATION_ROUTE_ID, PRIMARY_BAR_NOTIFICATIONS } from './constants';
import { AppView } from './views/app-view';
import { NotificationsTooltipView } from './views/notifications-tooltip-view';

const App = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  useEffect(() => {
    if (isAdvanced) {
      const primarybarSection = {
        id: LOG_AND_QUEUES,
        label: t('label.long_and_queues', 'Log & Queues'),
        position: 5,
      };
      addRoute({
        route: NOTIFICATION_ROUTE_ID,
        position: 1,
        visible: true,
        label: t('label.notifications', 'Notifications') || '',
        primaryBar: 'BellOutline',
        appView: AppView,
        primarybarSection,
        tooltip: NotificationsTooltipView,
        trackerLabel: PRIMARY_BAR_NOTIFICATIONS,
      });
    } else {
      removeRoute(NOTIFICATION_ROUTE_ID);
    }
  }, [isAdvanced, t]);

  return null;
};

export default App;
