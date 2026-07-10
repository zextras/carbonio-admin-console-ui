/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryBarTooltip } from '@zextras/ui-components';
import { addRoute, getRights, useCurrentUserRights } from '@zextras/ui-shared';
import { FC, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  LIST_SERVER,
  MANAGE_APP_ID,
  PRIMARY_BAR_STORAGE,
  SERVER,
  STORAGES_ROUTE_ID,
} from './constants';
import { AppView } from './views/app-view';

const App: FC = () => {
  const [t] = useTranslation();

  const { data: rights } = useCurrentUserRights();
  const hasListServerRights =
    !!rights &&
    rights.length > 0 &&
    getRights(rights, SERVER).some(
      (item: Record<string, string>) => item?.n && item?.n === LIST_SERVER,
    );

  const managementSection = {
    id: MANAGE_APP_ID,
    label: t('label.management', 'Management'),
    position: 3,
  };

  const StorageTooltipView: FC = () => (
    <PrimaryBarTooltip>
      <p>
        <Trans
          i18nKey="label.storage_lbl"
          defaults="<bold>Storage</bold>"
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
      <p>
        <Trans
          i18nKey="label.storage_primarybar_tooltip"
          defaults="View your <bold>server status</bold>, your <bold>volumes</bold> and <bold>HSM policies</bold>. You’ll also be able to <bold>connect buckets</bold>."
          components={{ bold: <strong /> }}
          t={t}
        />
      </p>
    </PrimaryBarTooltip>
  );

  useEffect(() => {
    if (hasListServerRights) {
      addRoute({
        route: STORAGES_ROUTE_ID,
        position: 4,
        visible: true,
        label: t('label.storage', 'Storage') || '',
        primaryBar: 'HardDriveOutline',
        appView: AppView,
        primarybarSection: { ...managementSection },
        tooltip: StorageTooltipView,
        trackerLabel: PRIMARY_BAR_STORAGE,
      });
    }
  }, [StorageTooltipView, hasListServerRights, managementSection, t]);

  return null;
};

export default App;
