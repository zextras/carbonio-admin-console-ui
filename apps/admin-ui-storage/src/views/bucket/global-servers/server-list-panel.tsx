/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Input, Row, type THeader } from '@zextras/ui-components';
import { useIsAdvanced, useMailstoreServers } from '@zextras/ui-shared';
import { type ChangeEvent, type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useServerVolumeSummary } from '../../../services/use-server-volume-summary';
import { headerAdvanced } from '../../utility/utils';
import { ServersListTable } from './server-list-table';

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
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto', position: 'relative' }}
      background="white"
    >
      <Row mainAlignment="flex-start" padding={{ all: 'large' }}>
        <ds-text as="h2" weight="bold">
          {t('buckets.servers_list', 'Servers List')}
        </ds-text>
      </Row>
      <ds-divider></ds-divider>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        height="calc(100vh - 200px)"
        padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%">
          <Container height="fit" crossAlignment="flex-start" background="gray6">
            <Row
              orientation="horizontal"
              mainAlignment="space-between"
              crossAlignment="flex-start"
              width="fill"
              padding={{ top: 'small', bottom: 'large' }}
            >
              <Container>
                <Input
                  disabled={serversList.length === 0 && searchServer.length === 0}
                  label={t('label.search_for_a_Server', `Search for a Server`)}
                  backgroundColor="gray5"
                  CustomIcon={(): ReactElement => (
                    <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                  )}
                  value={searchServer}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    setSearchServer(e.target.value);
                  }}
                />
              </Container>
            </Row>
          </Container>
        </Row>
        <Row width="100%">
          <ServersListTable
            volumes={serversList}
            headers={isAdvanced ? serverHeaderAdvanced : headerCE}
          />
        </Row>
      </Container>
    </Container>
  );
};
