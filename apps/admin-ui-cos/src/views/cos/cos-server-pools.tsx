/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  ListRow,
  Padding,
  Row,
  Switch,
  type THeader,
  type TRow,
} from '@zextras/ui-components';
import { useCurrentUserRights, useMailstoreServers } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../types/attribute';
import { COS, ZIMBRA_ADMIN_URN } from '../../constants';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import { ModifyCosBody } from '../../services/modify-cos-service';
import { useCosDetail } from '../../services/use-cos-detail';
import { useModifyCos } from '../../services/use-modify-cos';
import { DisablePoolModal } from './disable-pool-modal';
import { ServerPoolTable } from './server-pool-table';

type ServerItem = {
  id?: string;
  name?: string;
  a?: Array<Attribute>;
};

function isPoolEnabled(poolList: Array<Attribute>, serverId?: string): boolean {
  return !!poolList.find((sp) => serverId === sp?._content)?.c;
}

export const CosServerPools = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const { data: cosDetailData, isPending } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const { data: allMailStoreList = [] } = useMailstoreServers();
  const { data: rights = [] } = useCurrentUserRights();
  const modifyCosMutation = useModifyCos(cosId);

  const [selectedTableRows, setSelectedTableRows] = useState<Array<ServerItem>>([]);
  const [selectedTableRowsId, setSelectedTableRowsId] = useState<Array<string>>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [searchServer, setSearchServer] = useState<string>('');
  const debouncedSearch = useDebouncedValue(searchServer, 700);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
  const readonlyCOS = !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;

  const poolList: Array<Attribute> =
    cosInformation?.filter((item) => item?.n === 'zimbraMailHostPool') ?? [];

  const allDisabled = poolList.length > 0 && poolList.every((item) => !item?.c);

  const selectedServer = selectedTableRows[0];

  const enable = !!selectedServer && !isPoolEnabled(poolList, selectedServer.id);
  const disable = !!selectedServer && isPoolEnabled(poolList, selectedServer.id);

  const handleSelect = (item: ServerItem) => {
    setSelectedTableRows([item]);
    setSelectedTableRowsId([item?.id ?? '']);
  };

  const filteredServers = allMailStoreList
    .filter((item) =>
      statusFilter === 'enabled'
        ? isPoolEnabled(poolList, item.id)
        : statusFilter === 'disabled'
          ? !isPoolEnabled(poolList, item.id)
          : true,
    )
    .filter((item) => debouncedSearch === '' || !!item?.name?.includes(debouncedSearch));

  const serverTableRows: Array<TRow> = filteredServers.map((item) => ({
    id: item?.id ?? '',
    columns: [
      <Container
        crossAlignment="flex-start"
        key={`name-${item?.id}`}
        style={{ cursor: 'pointer' }}
        onClick={(e: React.MouseEvent): void => {
          e.stopPropagation();
          handleSelect(item);
        }}
      >
        <ds-text as="span" size="small" weight="regular" color="gray0">
          {item?.name}
        </ds-text>
      </Container>,
      <Container
        crossAlignment="flex-start"
        key={`status-${item?.id}`}
        style={{ cursor: 'pointer' }}
        onClick={(e: React.MouseEvent): void => {
          e.stopPropagation();
          handleSelect(item);
        }}
      >
        <ds-text as="span">
          {isPoolEnabled(poolList, item.id) ? (
            <ds-text as="span" size="small" weight="light">
              {t('cos.enabled', 'Enabled')}
            </ds-text>
          ) : (
            <ds-text as="span" size="small" weight="light" color="error">
              {t('cos.disabled', 'Disabled')}
            </ds-text>
          )}
        </ds-text>
      </Container>,
    ],
  }));

  const tableHeader: Array<THeader> = [
    {
      id: 'name_server',
      label: t('cos.name_server', 'Name Server'),
      width: '80%',
      bold: true,
    },
    {
      id: 'status',
      label: t('cos.status', 'Status'),
      width: '20%',
      align: 'left' as const,
      bold: true,
      items: [
        { label: t('cos.enabled', 'Enabled'), value: 'enabled' },
        { label: t('cos.disabled', 'Disabled'), value: 'disabled' },
      ],
      onChange: (selected): void => {
        setStatusFilter(selected[0]?.value ?? '');
      },
    },
  ];

  function onModifyCOS(body: ModifyCosBody) {
    modifyCosMutation.mutate(body, {
      onSuccess: () => {
        setOpenConfirmDialog(false);
        setSelectedTableRows([]);
        setSelectedTableRowsId([]);
      },
    });
  }

  function onEnable() {
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      a: [
        ...poolList.map((item) => ({
          n: 'zimbraMailHostPool',
          _content: item?._content,
        })),
        {
          n: 'zimbraMailHostPool',
          _content: selectedServer?.id ?? '',
        },
      ],
      id: {
        _content: cosId as string,
      },
    };
    onModifyCOS(body);
  }

  function onDisableServer() {
    const allServers = poolList.filter((item) => item?._content !== selectedServer?.id);
    const attributes: Array<Attribute> =
      allServers.length === 0
        ? [{ n: 'zimbraMailHostPool', _content: '' }]
        : allServers.map((item) => ({
            n: 'zimbraMailHostPool',
            _content: item?._content,
          }));
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      id: {
        _content: cosId ?? '',
      },
      a: attributes,
    } as ModifyCosBody;

    onModifyCOS(body);
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchServer(e.target.value);
  };

  if (isPending) {
    return (
      <Container crossAlignment="center" mainAlignment="center" height="fill">
        <ds-spinner />
      </Container>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        flex: '1 1 0%',
        height: '100%',
        padding: '1.5rem',
      }}
    >
      <Container orientation="horizontal" height="fit" padding={{ all: 'medium' }}>
        <Row takeAvailableSpace mainAlignment="flex-start" minHeight="35px">
          <ds-text as="strong" weight="bold" color="gray0">
            {t('label.server_pools', 'Server Pools')}
          </ds-text>
        </Row>
      </Container>
      <ds-divider></ds-divider>
      <Container
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ horizontal: 'medium', vertical: 'large' }}
        style={{ overflowY: 'auto' }}
      >
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          style={{ overflow: 'auto' }}
          width="100%"
        >
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
            width="100%"
          >
            <ListRow>
              <ds-text as="strong" weight="bold">
                {t('cos.general_options', 'General Options')}
              </ds-text>
            </ListRow>
            <ListRow>
              <Padding bottom="large" top="large">
                <Switch
                  value={!allDisabled}
                  label={t(
                    'cos.limt_serverpool_avaiable_create_user',
                    'Limit server pool available for creating new users in this COS',
                  )}
                  onClick={(): void => {
                    // Toggle is read-only display based on pool data — actual changes go through onEnable/onDisableServer
                  }}
                  iconColor="primary"
                />
              </Padding>
            </ListRow>
            {!allDisabled && (
              <ServerPoolTable
                searchValue={searchServer}
                onSearchChange={handleSearchChange}
                isSearchDisabled={
                  (allMailStoreList.length === 0 && searchServer.length === 0) || readonlyCOS
                }
                enableDisabled={!enable || readonlyCOS}
                disableDisabled={!disable || readonlyCOS}
                onEnable={onEnable}
                onDisableClick={() => setOpenConfirmDialog(true)}
                tableRows={serverTableRows}
                tableHeaders={tableHeader}
                selectedRows={selectedTableRowsId}
              />
            )}
          </Container>
        </Container>
      </Container>

      <DisablePoolModal
        open={openConfirmDialog}
        onClose={(): void => setOpenConfirmDialog(false)}
        serverName={allMailStoreList.find((sp) => sp?.id === selectedServer?.id)?.name}
        onDisable={onDisableServer}
      />
    </div>
  );
};
