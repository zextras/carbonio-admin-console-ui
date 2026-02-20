/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, removeRoute, useHasAllRights, useIsAdvanced } from '@zextras/ui-shared';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BACKUP_ROUTE_ID, PRIMARY_BAR_BACKUP, SERVICES_ROUTE_ID } from './constants';
import AppView from './views/app-view';

const App: FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const isAdvanced = useIsAdvanced();
  const hasAllConfigRights = useHasAllRights();

  const servicesSection = useMemo(
    () => ({
      id: SERVICES_ROUTE_ID,
      label: t('label.services', 'Services'),
      position: 4,
    }),
    [t],
  );

  const backupTooltipItems = useMemo(
    () => [
      {
        header: (
          <>
            <Trans
              i18nKey="label.backup_lbl"
              defaults="<bold>Backup</bold>"
              components={{ bold: <strong /> }}
              t={t}
            />
            {'\n\n'}
            <Trans
              i18nKey="label.backup_primarybar_tooltip"
              defaults="Manage your <bold>backup services</bold>, view their <bold>status</bold>, the <bold>servers list</bold> or <bold>import an existing backup</bold>."
              components={{ bold: <strong /> }}
              t={t}
            />
          </>
        ),
        options: [],
      },
    ],
    [t],
  );

  const BackupTooltipView: FC = useCallback(
    () => <PrimaryBarTooltip items={backupTooltipItems} />,
    [backupTooltipItems],
  );

  useEffect(() => {
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
  }, [BackupTooltipView, hasAllConfigRights, isAdvanced, servicesSection, t]);

  return null;
};

export default App;
