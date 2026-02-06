/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced, useMailstoreServers } from '@zextras/admin-ui-bootstrap';
import { Button, Container, HoverableRowFactory, Table, Text } from '@zextras/ui-components';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import ListRow from '../list/list-row';

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

const DashboardServerList: FC<{
  goToMailStoreServerList: () => void;
  serverVersion: any;
}> = ({ goToMailStoreServerList, serverVersion }) => {
  const [t] = useTranslation();
  const { data: mailstoresList = [] } = useMailstoreServers();
  const [serverListRow, setServerListRow] = useState<Array<any>>([]);
  const isAdvanced = useIsAdvanced();

  useEffect(() => {
    if (mailstoresList.length > 0) {
      const allRows = mailstoresList.map((item) => ({
        id: item?.id,
        columns: [
          <Text
            size="small"
            color="gray0"
            weight="regular"
            key={item.id}
            onClick={(event: { stopPropagation: () => void }): void => {
              event.stopPropagation();
            }}
          >
            {item?.name}
          </Text>,
          <Text
            size="small"
            weight="regular"
            color="gray6"
            key={item?.name}
            style={getVersionTextStyle()}
            onClick={(event: { stopPropagation: () => void }): void => {
              event.stopPropagation();
            }}
          >
            {`${serverVersion?.majorversion}.${serverVersion?.minorversion}.${serverVersion?.microversion}`}
          </Text>,
          isAdvanced ? (
            <Text
              size="small"
              weight="regular"
              color="gray6"
              key={item?.name}
              style={getVersionTextStyle()}
              onClick={(event: { stopPropagation: () => void }): void => {
                event.stopPropagation();
              }}
            >
              {`${serverVersion?.majorversion}.${serverVersion?.minorversion}.${serverVersion?.microversion}`}
            </Text>
          ) : (
            ''
          ),
          <Text
            size="small"
            color="gray0"
            weight="light"
            key={item?.name}
            onClick={(event: { stopPropagation: () => void }): void => {
              event.stopPropagation();
            }}
          >
            {item && item?.a
              ? item?.a.find((attribute: any) => attribute?.n === 'description')?._content
              : ''}
          </Text>,
        ],
      }));
      setServerListRow(allRows);
    } else {
      setServerListRow([]);
    }
  }, [mailstoresList, serverVersion, isAdvanced]);

  const headers: any[] = useMemo(
    () => [
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
    ],
    [t, isAdvanced],
  );

  return (
    <Container background="gray6">
      <ListRow>
        <Container
          padding={{ all: 'extralarge' }}
          mainAlignment="flex-start"
          crossAlignment="flex-start"
        >
          <ListRow>
            <Container mainAlignment="flex-start" crossAlignment="flex-start" width="2.2rem">
              <icon-wc icon-name="HardDriveOutline" size="large"></icon-wc>
            </Container>
            <Container mainAlignment="center" crossAlignment="flex-start">
              <Text size="medium" color="gray0" weight="bold">
                {t('label.mailstores_list', 'Mailstores List')}
              </Text>
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
          maxHeight="calc(100vh - 25rem)"
          minHeight="auto"
        >
          <Table
            rows={serverListRow}
            headers={headers}
            showCheckbox={false}
            multiSelect={false}
            style={{ overflow: 'auto', height: '100%' }}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
    </Container>
  );
};
export default DashboardServerList;
