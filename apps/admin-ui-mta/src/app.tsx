/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useHasAllRights } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { MANAGE_APP_ID, MTA_ROUTE_ID, PRIMARY_BAR_MTA } from './constants';
import { AppView } from './views/app-view';
import { MtaTooltipView } from './views/mta-tooltip-view';

function App() {
  const [t] = useTranslation();
  const hasAllConfigRights = useHasAllRights();

  useEffect(() => {
    if (hasAllConfigRights) {
      addRoute({
        route: MTA_ROUTE_ID,
        position: 3,
        visible: true,
        label: t('label.mail_trans_agent', 'Mail Trans. Agent') || '',
        primaryBar: 'MailFolderOutline',
        appView: AppView,
        primarybarSection: {
          id: MANAGE_APP_ID,
          label: t('label.management', 'Management'),
          position: 3,
        },
        tooltip: MtaTooltipView,
        trackerLabel: PRIMARY_BAR_MTA,
      });
    } else {
      removeRoute(MTA_ROUTE_ID);
    }
  }, [hasAllConfigRights, t]);

  return null;
}

export default App;
