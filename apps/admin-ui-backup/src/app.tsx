/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BACKUP_ROUTE_ID, PRIMARY_BAR_BACKUP, SERVICES_ROUTE_ID } from './constants';
import { AppView } from './views/app-view';

const BackupTooltipView = () => {
  const [t] = useTranslation();
  return (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.backup_lbl"
          defaults="<bold>Backup</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.backup_primarybar_tooltip"
          defaults="Manage your <bold>backup services</bold>, view their <bold>status</bold>, the <bold>servers list</bold> or <bold>import an existing backup</bold>."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );
};

const App = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const hasAllConfigRights = useHasAllRights();

  useEffect(() => {
    const servicesSection = {
      id: SERVICES_ROUTE_ID,
      label: t('label.services', 'Services'),
      position: 4,
    };
    if (hasAllConfigRights) {
      if (isAdvanced) {
        addRoute({
          route: BACKUP_ROUTE_ID,
          position: 1,
          visible: true,
          label: t('label.backup', 'Backup') || '',
          primaryBar: 'BackupOutline',
          appView: AppView,
          primarybarSection: { ...servicesSection },
          tooltip: BackupTooltipView,
          trackerLabel: PRIMARY_BAR_BACKUP,
        });
      }
    } else {
      removeRoute(BACKUP_ROUTE_ID);
    }
  }, [hasAllConfigRights, isAdvanced, t]);

  return null;
};

export default App;
