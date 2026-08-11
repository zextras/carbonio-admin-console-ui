/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useHasAllRights } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { MANAGE_APP_ID, PRIMARY_BAR_PRIVACY, PRIVACY_ROUTE_ID } from './constants';
import { AppView } from './views/app-view';
import { PrivacyTooltipView } from './views/privacy-tooltip-view';

function App() {
  const [t] = useTranslation();
  const hasAllConfigRights = useHasAllRights();

  useEffect(() => {
    if (hasAllConfigRights) {
      addRoute({
        route: PRIVACY_ROUTE_ID,
        position: 6,
        visible: true,
        label: t('label.privacy', 'Privacy'),
        primaryBar: 'ShieldOutline',
        appView: AppView,
        primarybarSection: {
          id: MANAGE_APP_ID,
          label: t('label.management', 'Management'),
          position: 3,
        },
        tooltip: PrivacyTooltipView,
        trackerLabel: PRIMARY_BAR_PRIVACY,
      });
    } else {
      removeRoute(PRIVACY_ROUTE_ID);
    }
  }, [hasAllConfigRights, t]);

  return null;
}

export default App;
