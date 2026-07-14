/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Input, type THeader } from '@zextras/ui-components';
import { useIsAdvanced, useMailstoreServers } from '@zextras/ui-shared';
import { type ChangeEvent, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useServerVolumeSummary } from '../../services/use-server-volume-summary';
import { headerAdvanced } from '../utility/utils';
import styles from './server-list-panel.module.css';
import { ServersListTable } from './server-list-table';

function SearchFilterIcon(): ReactElement {
  return (
    <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
  );
}

export const ServerListPanel = () => {
  const [t] = useTranslation();
  const { data: allServersList = [] } = useMailstoreServers();
  const isAdvanced = useIsAdvanced();
  const { data: serverListAll = [], isLoading } = useServerVolumeSummary(
    isAdvanced,
    allServersList,
  );
  const serverHeaderAdvanced = headerAdvanced(t);
  const [searchServer, setSearchServer] = useState<string>('');

  const serversList = serverListAll.filter((item) => item.name.includes(searchServer));

  const headerCE: Array<THeader> = [
    {
      id: 'Server',
      label: t('volume.server_list_header.server', 'Server'),
      i18nAllLabel: 'All',
      width: '60%',
      bold: true,
    },
    {
      id: 'Description',
      label: t('volume.server_list_header.description', 'Description'),
      i18nAllLabel: 'All',
      width: '30%',
      bold: true,
    },
  ];

  if (isLoading) return <ds-page-shimmer></ds-page-shimmer>;

  return (
    <div className={styles.panel}>
      <div className={styles.title}>
        <ds-text as="h2" weight="bold">
          {t('buckets.servers_list', 'Servers List')}
        </ds-text>
      </div>
      <ds-divider></ds-divider>
      <div className={styles.content}>
        <div className={styles.searchBox}>
          <Input
            disabled={serversList.length === 0 && searchServer.length === 0}
            label={t('label.search_for_a_Server', `Search for a Server`)}
            backgroundColor="gray5"
            CustomIcon={SearchFilterIcon}
            value={searchServer}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setSearchServer(e.target.value);
            }}
          />
        </div>
        <div className={styles.tableSection}>
          <ServersListTable
            volumes={serversList}
            headers={isAdvanced ? serverHeaderAdvanced : headerCE}
          />
        </div>
      </div>
    </div>
  );
};
