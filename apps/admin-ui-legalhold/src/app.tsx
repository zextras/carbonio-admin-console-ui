/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { LEGAL_HOLD_ROUTE_ID, PRIMARY_BAR_LEGAL_HOLD, SERVICES_ROUTE_ID } from './constants';
import { AppView } from './views/app-view';
import { LegalHoldTooltipView } from './views/legal-hold-tooltip-view';

const App = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const hasAllConfigRights = useHasAllRights();

  useEffect(() => {
    if (!isAdvanced) {
      return;
    }
    if (hasAllConfigRights) {
      addRoute({
        route: LEGAL_HOLD_ROUTE_ID,
        position: 2,
        visible: true,
        label: t('label.legal_hold', 'Legal Hold') || '',
        primaryBar: 'LockOutline',
        appView: AppView,
        primarybarSection: {
          id: SERVICES_ROUTE_ID,
          label: t('label.services', 'Services'),
          position: 4,
        },
        tooltip: LegalHoldTooltipView,
        trackerLabel: PRIMARY_BAR_LEGAL_HOLD,
      });
    } else {
      removeRoute(LEGAL_HOLD_ROUTE_ID);
    }
  }, [hasAllConfigRights, isAdvanced, t]);

  return null;
};

export default App;
