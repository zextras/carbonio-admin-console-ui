/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';
import { FC, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MANAGE_APP_ID, PRIMARY_BAR_SUBSCRIPTIONS, SUBSCRIPTIONS_ROUTE_ID } from './constants';
import { AppView } from './views/app-view';

function SubscriptionTooltipView() {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.subscription_lbl"
          defaults="<bold>Subscription</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.subscription_primarybar_tooltip"
          defaults="View your <bold>subscription details</bold> and/or <bold>activate</bold> your new one."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );
}

const App: FC = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();

  const hasAllConfigRights = useHasAllRights();

  useEffect(() => {
    if (isAdvanced && hasAllConfigRights) {
      const managementSection = {
        id: MANAGE_APP_ID,
        label: t('label.management', 'Management'),
        position: 3,
      };
      addRoute({
        route: SUBSCRIPTIONS_ROUTE_ID,
        position: 5,
        visible: true,
        label: t('label.subscriptions', 'Subscriptions') || '',
        primaryBar: 'AwardOutline',
        appView: AppView,
        primarybarSection: { ...managementSection },
        tooltip: SubscriptionTooltipView,
        trackerLabel: PRIMARY_BAR_SUBSCRIPTIONS,
      });
    } else {
      removeRoute(SUBSCRIPTIONS_ROUTE_ID);
    }
  }, [hasAllConfigRights, isAdvanced, t]);

  return null;
};

export default App;
