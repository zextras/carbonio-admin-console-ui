/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Row,
  Table,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { type FC } from 'react';

import { DATA_VOLUMES } from '../../../constants';
import { type ServerVolumeSummaryItem } from '../../../services/server-volume-summary-service';
import { ServerListCell } from './server-list-cell';

type ServersListTableProps = {
  volumes: Array<ServerVolumeSummaryItem>;
  headers: Array<THeader>;
  isAdvanced: boolean;
  t: TFunction;
  isRequestInProgress: boolean;
};

export const ServersListTable: FC<ServersListTableProps> = ({
  volumes,
  headers,
  isAdvanced,
  t,
  isRequestInProgress,
}) => {
  const tableRows: Array<TRow> = volumes.map((v) => ({
    id: v.name,
    clickable: true,
    columns: isAdvanced
      ? [
          <ServerListCell key={`${v.name}-name`} name>
            {v.name}
          </ServerListCell>,
          <ServerListCell key={`${v.name}-primaries`}>{v.primaries}</ServerListCell>,
          <ServerListCell key={`${v.name}-secondaries`}>{v.secondaries}</ServerListCell>,
          <ServerListCell key={`${v.name}-indexes`}>{v.indexes}</ServerListCell>,
          <ServerListCell key={`${v.name}-hsm`}>
            {v.hsmScheduled ? t('label.scheduled', 'Scheduled') : t('label.disabled', 'Disabled')}
          </ServerListCell>,
          <ServerListCell key={`${v.name}-indexer`}>
            {v.indexer?.running
              ? t('volume.running', 'Running')
              : t('volume.not_running', 'Not Running')}
          </ServerListCell>,
          <ServerListCell key={`${v.name}-description`}>{v.description}</ServerListCell>,
        ]
      : [
          <ServerListCell key={`${v.name}-name`} name>
            {v.name}
          </ServerListCell>,
          <ServerListCell key={`${v.name}-description`}>{v.description}</ServerListCell>,
        ],
  }));

  function onSelectionChange(ids: string[]) {
    const id = ids[0];
    if (!id) return;
    const server = volumes.find((v) => v.name === id);
    if (server?.name) {
      replaceHistory(`/${server.name}/${DATA_VOLUMES}`);
    }
  }

  return (
    <Container crossAlignment="flex-start">
      <Table
        headers={headers}
        rows={tableRows}
        showCheckbox={false}
        multiSelect={false}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
        onSelectionChange={onSelectionChange}
      />
      {isRequestInProgress && (
        <Container
          crossAlignment="center"
          mainAlignment="center"
          height="fit"
          padding={{ top: 'medium' }}
        >
          <ds-spinner></ds-spinner>
        </Container>
      )}
      {volumes.length === 0 && !isRequestInProgress && (
        <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
          <ds-text as="p">{t('label.this_list_is_empty', 'This list is empty.')}</ds-text>
        </Row>
      )}
    </Container>
  );
};
