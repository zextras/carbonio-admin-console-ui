/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Paging,
  Table,
  type THeader,
  TrackNumberPerPage,
  type TRow,
} from '@zextras/ui-components';
import { useIsAdvanced, useMailstoreServers } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_PAGE_SIZE = 10;

function getVersionTextStyle(): React.CSSProperties {
  return {
    background: 'var(--color-primary-regular)',
    width: '4.813rem',
    borderRadius: '3.125rem',
    padding: '0.188rem 0 0 0',
    height: '1.188rem',
    textAlign: 'center',
  };
}

function stopClickPropagation(event: React.MouseEvent): void {
  event.stopPropagation();
}

type DashboardServerListProps = {
  goToMailStoreServerList: () => void;
  serverVersion: string;
};

export const DashboardServerList = ({
  goToMailStoreServerList,
  serverVersion,
}: DashboardServerListProps) => {
  const [t] = useTranslation();
  const { data: mailstoresList = [] } = useMailstoreServers();
  const isAdvanced = useIsAdvanced();
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const totalServers = mailstoresList.length;
  const paginatedList = mailstoresList.slice(offset, offset + limit);

  function handlePageSizeChange(newLimit: number): void {
    setLimit(newLimit);
    setOffset(0);
  }

  const serverListRow: Array<TRow> =
    paginatedList.length > 0
      ? paginatedList.map((item) => ({
          id: item?.id ?? '',
          columns: [
            <ds-text
              as="span"
              size="small"
              color="gray0"
              weight="regular"
              key={`name-${item?.id}`}
              onClick={stopClickPropagation}
            >
              {item?.name}
            </ds-text>,
            <ds-text
              as="span"
              size="small"
              weight="regular"
              color="gray6"
              key={`core-${item?.id}`}
              style={getVersionTextStyle()}
              onClick={stopClickPropagation}
            >
              {serverVersion}
            </ds-text>,
            isAdvanced ? (
              <ds-text
                as="span"
                size="small"
                weight="regular"
                color="gray6"
                key={`advanced-${item?.id}`}
                style={getVersionTextStyle()}
                onClick={stopClickPropagation}
              >
                {serverVersion}
              </ds-text>
            ) : (
              ''
            ),
            <ds-text
              as="span"
              size="small"
              color="gray0"
              weight="light"
              key={`description-${item?.id}`}
              onClick={stopClickPropagation}
            >
              {item && item?.a
                ? item?.a.find((attribute) => attribute?.n === 'description')?._content
                : ''}
            </ds-text>,
          ],
        }))
      : [];

  const headers: Array<THeader> = [
    {
      id: 'server_name',
      label: t('dashboard.server_name', 'Server name'),
      width: '25%',
      bold: true,
    },
    {
      id: 'carbonio_core',
      label: t('dashboard.core_version', 'Core Version'),
      width: '20%',
      bold: true,
    },
    {
      id: 'carbonio',
      label: '',
      width: isAdvanced ? '20%' : '0%',
      bold: true,
    },
    {
      id: 'description',
      label: t('dashboard.description', 'Description'),
      width: '35%',
      bold: true,
    },
  ];

  return (
    <Container background="gray6" height="auto">
      <ListRow>
        <Container
          padding={{ all: 'extralarge' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <ListRow>
            <Container mainAlignment="flex-start" crossAlignment="flex-start" width="2.2rem">
              <ds-icon icon="HardDriveOutline" size="large"></ds-icon>
            </Container>
            <Container mainAlignment="center" crossAlignment="flex-start">
              <ds-text as="strong" size="medium" color="gray0" weight="bold">
                {t('label.mailstores_list', 'Mailstores List')}
              </ds-text>
            </Container>
          </ListRow>
        </Container>
        <Container
          mainAlignment="flex-end"
          crossAlignment="flex-end"
          padding={{ all: 'extralarge' }}
        >
          <Button
            type="ghost"
            label={t('dashboard.go_to_mailstores_server_list', 'Go to mailstores servers list')}
            color="primary"
            onClick={goToMailStoreServerList}
            size="large"
          />
        </Container>
      </ListRow>
      <ListRow>
        <Container
          orientation="horizontal"
          mainAlignment="space-between"
          crossAlignment="flex-start"
          width="fill"
          height="auto"
        >
          <Table
            rows={serverListRow}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
      {totalServers > 0 && (
        <Container orientation="horizontal" mainAlignment="space-between" width="fill">
          <Paging
            key={limit}
            totalItem={totalServers}
            setOffset={setOffset}
            pageSize={limit}
          />
          <TrackNumberPerPage setPageSize={handlePageSizeChange} />
        </Container>
      )}
    </Container>
  );
};
