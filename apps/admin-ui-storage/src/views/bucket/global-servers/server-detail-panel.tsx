/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Row,
  Table,
} from '@zextras/ui-components';
import { useIsAdvanced, useMailstoreServers } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { ChangeEvent, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useServerVolumeSummary } from '../../../services/use-server-volume-summary';
import { headerAdvanced } from '../../utility/utils';

const ServersListTable: FC<{
  volumes: Array<any>;
  headers: any;
  isAdvanced: any;
  t: TFunction;
  isRequestInProgress: boolean;
}> = ({ volumes, headers, isAdvanced, t, isRequestInProgress }) => {
  const tableRowsAdvance = volumes.map((v, i) => ({
    id: i?.toString(),
    columns: [
      <Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
        <ds-text as="span" size="small" weight="regular">
          {v?.name}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.primaries}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.secondaries}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.indexes}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.hsmScheduled ? t('label.scheduled', 'Scheduled') : t('label.disabled', 'Disabled')}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v.indexer?.running === true
            ? t('volume.running', 'Running')
            : t('volume.not_running', 'Not Running')}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.description}
        </ds-text>
      </Row>,
    ],
    clickable: true,
  }));

  const tableRowCe = volumes.map((v, i) => ({
    id: i?.toString(),
    columns: [
      <Row style={{ textAlign: 'left', justifyContent: 'flex-start' }} key={i}>
        <ds-text as="span" size="small" weight="regular">
          {v?.name}
        </ds-text>
      </Row>,
      <Row
        key={i}
        style={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
        }}
      >
        <ds-text as="span" size="small" weight="light">
          {v?.description}
        </ds-text>
      </Row>,
    ],
    clickable: true,
  }));

  return (
    <Container crossAlignment="flex-start">
      <Table
        headers={headers}
        rows={isAdvanced ? tableRowsAdvance : tableRowCe}
        showCheckbox={false}
        multiSelect={false}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
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
      {(tableRowsAdvance.length === 0 || tableRowCe.length === 0) && !isRequestInProgress && (
        <Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
          <ds-text as="p">{t('label.this_list_is_empty', 'This list is empty.')}</ds-text>
        </Row>
      )}
    </Container>
  );
};

const FunnelFilterIcon: FC = () => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

export const ServerDetailPanel: FC = () => {
  const [t] = useTranslation();
  const { data: allServersList = [] } = useMailstoreServers();
  const isAdvanced = useIsAdvanced();
  const { data: serverListAll = [], isLoading: isRequestInProgress } = useServerVolumeSummary(
    isAdvanced,
    allServersList,
  );
  const serverHeaderAdvanced = headerAdvanced(t);
  const [searchServer, setSearchServer] = useState<string>('');

  const serversList = serverListAll.filter((item: any) => item.name?.includes(searchServer));

  const headerCE = [
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
                  CustomIcon={FunnelFilterIcon}
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
            isAdvanced={isAdvanced}
            t={t}
            isRequestInProgress={isRequestInProgress}
          />
        </Row>
      </Container>
    </Container>
  );
};
