/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  ListRow,
  Modal,
  Padding,
  Row,
  Switch,
  Table,
  type THeader,
  type TRow,
  useSnackbar,
} from '@zextras/ui-components';
import { useCurrentUserRights, useMailstoreServers } from '@zextras/ui-shared';
import { debounce, find } from 'lodash-es';
import { ChangeEvent, FC, ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../types/attribute';
import { COS, ZIMBRA_ADMIN_URN } from '../../constants';
import { cosQueryKeys } from '../../services/cos-query-keys';
import { flushCache } from '../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../services/modify-cos-service';
import { useCosDetail } from '../../services/use-cos-detail';
import { PageLayout } from '../page-layout';

type ServerItem = {
  id?: string;
  name?: string;
  a?: Array<Attribute>;
};

function isPoolEnabled(poolList: Array<Attribute>, serverId?: string): boolean {
  return !!poolList.find((sp) => serverId === sp?._content)?.c;
}

export const CosServerPools: FC = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const { data: cosDetailData } = useCosDetail(cosId);
  const cosInformation = cosDetailData?.cos?.[0]?.a;
  const queryClient = useQueryClient();
  const createSnackbar = useSnackbar();
  const { data: allMailStoreList = [] } = useMailstoreServers();
  const { data: rights = [] } = useCurrentUserRights();

  const [selectedTableRows, setSelectedTableRows] = useState<Array<ServerItem>>([]);
  const [selectedTableRowsId, setSelectedTableRowsId] = useState<Array<string>>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [searchServer, setSearchServer] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const searchDebounceRef = useRef(debounce((text: string) => setDebouncedSearch(text), 700));

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

  const filteredServers = (() => {
    let items: Array<ServerItem> = allMailStoreList;
    if (statusFilter === 'enabled') {
      items = items.filter((item) => isPoolEnabled(poolList, item.id));
    } else if (statusFilter === 'disabled') {
      items = items.filter((item) => !isPoolEnabled(poolList, item.id));
    }
    if (debouncedSearch !== '') {
      items = items.filter((item) => item?.name?.includes(debouncedSearch));
    }
    return items;
  })();

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
    modifyCos(body)
      .then(() => {
        flushCache('cos', 'id', body.id._content);
        if (cosId) {
          queryClient.invalidateQueries({ queryKey: cosQueryKeys.detail(cosId) });
        }
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t(
            'label.the_last_changes_has_been_saved_successfully',
            'Changes have been saved successfully',
          ),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        setOpenConfirmDialog(false);
        setSelectedTableRows([]);
        setSelectedTableRowsId([]);
      })
      .catch((error) => {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: error?.message
            ? error?.message
            : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
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
    const value = e.target.value;
    setSearchServer(value);
    if (value === '') {
      setDebouncedSearch('');
    } else {
      searchDebounceRef.current(value);
    }
  };

  return (
    <PageLayout title={t('label.server_pools', 'Server Pools')}>
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
            <>
              <Row mainAlignment="flex-start" width="100%">
                <Container orientation="vertical" mainAlignment="space-around" height="56px">
                  <Row orientation="horizontal" width="100%">
                    <Row
                      padding={{ right: 'small' }}
                      mainAlignment="flex-start"
                      width="65%"
                      crossAlignment="flex-start"
                    >
                      <Input
                        value={searchServer}
                        disabled={
                          (allMailStoreList.length === 0 && searchServer.length === 0) ||
                          readonlyCOS
                        }
                        label={t('cos.search_a_specific_server', 'Search for a specific server')}
                        CustomIcon={(): ReactElement => (
                          <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                        )}
                        onChange={handleSearchChange}
                      />
                    </Row>
                    <Row padding={{ all: 'small' }} width="35%">
                      <Padding left="small" right="large">
                        <Button
                          type="outlined"
                          key="enable-button"
                          label={t('label.enable', 'enable')}
                          color="primary"
                          icon="CheckmarkCircleOutline"
                          iconPlacement="right"
                          disabled={!enable || readonlyCOS}
                          onClick={onEnable}
                          size="extralarge"
                        />
                      </Padding>

                      <Button
                        type="outlined"
                        key="disable-button"
                        label={t('label.disable', 'disable')}
                        color="error"
                        icon="CloseCircleOutline"
                        iconPlacement="right"
                        size="extralarge"
                        disabled={!disable || readonlyCOS}
                        onClick={() => setOpenConfirmDialog(true)}
                      />
                    </Row>
                  </Row>
                </Container>
              </Row>

              <Row
                orientation="horizontal"
                mainAlignment="space-between"
                crossAlignment="flex-start"
                width="fill"
                height="calc(100vh - 340px)"
                padding={{ top: 'large' }}
              >
                <Table
                  style={{ overflow: 'auto', height: '100%' }}
                  rows={serverTableRows}
                  headers={tableHeader}
                  showCheckbox={false}
                  selectedRows={selectedTableRowsId}
                  HeaderFactory={CustomHeaderFactory}
                  RowFactory={HoverableRowFactory}
                />
              </Row>
            </>
          )}
        </Container>
      </Container>

      <Modal
        title={t('cos.disabling_pool', 'Disabling pool')}
        open={openConfirmDialog}
        showCloseIcon
        onClose={(): void => {
          setOpenConfirmDialog(false);
        }}
        customFooter={
          <Container orientation="horizontal" mainAlignment="space-between" width="100%">
            <Container orientation="horizontal" mainAlignment="flex-start" width="25%">
              <Button
                label={t('label.helo', 'Help')}
                type="outlined"
                color="primary"
                onClick={() => setOpenConfirmDialog(false)}
              />
            </Container>

            <Container orientation="horizontal" mainAlignment="flex-end" width="75%">
              <Padding all="small">
                <Button
                  label={t('label.no_go_back', 'No, Go Back')}
                  color="secondary"
                  onClick={() => setOpenConfirmDialog(false)}
                />
              </Padding>
              <Button
                label={t('cos.yes_disable', 'Yes, Disable')}
                color="error"
                onClick={onDisableServer}
              />
            </Container>
          </Container>
        }
      >
        <Padding all="medium">
          <ds-text as="p" overflow="break-word" weight="regular">
            {t('cos.create_cos_success_msg', {
              serverName: allMailStoreList.find((sp) => sp?.id === selectedServer?.id)?.name,
              defaultValue:
                'You are disabling pool on {{serverName}}. All mailboxes will be not moved. Are you sure you want to delete it?',
            })}
          </ds-text>
        </Padding>
      </Modal>
    </PageLayout>
  );
};
