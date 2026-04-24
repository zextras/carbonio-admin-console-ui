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
import { ChangeEvent, FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Attribute } from '../../../types/attribute';
import { COS, DISABLED, ENABLED, ZIMBRA_ADMIN_URN } from '../../constants';
import { flushCache } from '../../services/flush-cache-service';
import { modifyCos, ModifyCosBody } from '../../services/modify-cos-service';
import { useCosStore } from '../../store/cos/store';
import { PageLayout } from '../page-layout';

type ServerItem = {
  id?: string;
  name?: string;
  a?: Array<Attribute>;
};

const CosServerPools: FC = () => {
  const [t] = useTranslation();
  const { cosId } = useParams();
  const cosInformation = useCosStore((state) => state.cos?.a);
  const [zimbraMailHostPool, setZimbraMailHostPool] = useState<boolean>(true);
  const [serverList, setServerList] = useState<Array<ServerItem>>([]);
  const [zimbraMailHostPoolList, setZimbraMailHostPoolList] = useState<Array<Attribute>>([]);
  const [serverTableRows, setServerTableRows] = useState<Array<TRow>>([]);
  const [selectedTableRows, setSelectedTableRows] = useState<Array<ServerItem>>([]);
  const [selectedTableRowsId, setSelectedTableRowsId] = useState<Array<string>>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const createSnackbar = useSnackbar();
  const setCos = useCosStore((state) => state.setCos);
  const [searchServer, setSearchServer] = useState<string>('');
  const { data: allMailStoreList = [] } = useMailstoreServers();
  const { data: rights = [] } = useCurrentUserRights();

  const readonlyCOS = useMemo(() => {
    const rightsConfig = find(rights, { type: COS }) || { all: [], type: COS };
    return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  useEffect(() => {
    if (allMailStoreList && allMailStoreList.length > 0) {
      setServerList(allMailStoreList);
    }
  }, [allMailStoreList]);

  useMemo(() => {
    if (serverList && serverList.length > 0) {
      const allRows = serverList.map((item) => ({
        id: item?.id ?? '',
        columns: [
          <Container
            crossAlignment="flex-start"
            key={item?.id}
            style={{ cursor: 'pointer' }}
            onClick={(e: React.MouseEvent): void => {
              e.stopPropagation();
              setSelectedTableRows([item]);
              setSelectedTableRowsId([item?.id ?? '']);
            }}
          >
            <ds-text as="span" size="small" weight="regular" key={item?.id} color="gray0">
              {item?.name}
            </ds-text>
          </Container>,
          <Container
            crossAlignment="flex-start"
            key={item?.id}
            style={{ cursor: 'pointer' }}
            onClick={(e: React.MouseEvent): void => {
              e.stopPropagation();
              setSelectedTableRows([item]);
              setSelectedTableRowsId([item?.id ?? '']);
            }}
          >
            <ds-text as="span" key={item?.id}>
              {zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c ? (
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
      setServerTableRows(allRows);
    }
  }, [serverList, zimbraMailHostPoolList, t]);

  const enable = useMemo(
    () =>
      selectedTableRows.length > 0 &&
      !zimbraMailHostPoolList.find((sp) => selectedTableRows[0]?.id === sp?._content)?.c,
    [selectedTableRows, zimbraMailHostPoolList],
  );

  const disable = useMemo(
    () =>
      (selectedTableRows.length > 0 &&
        zimbraMailHostPoolList.find((sp) => selectedTableRows[0]?.id === sp?._content)?.c) ||
      false,
    [selectedTableRows, zimbraMailHostPoolList],
  );

  useEffect(() => {
    if (!!cosInformation && cosInformation.length > 0) {
      const list = cosInformation.filter((item) => item?.n === 'zimbraMailHostPool');
      if (list) {
        setZimbraMailHostPoolList(list);
      }
    }
  }, [cosInformation]);

  const onFilterApply = useCallback(
    (e: string) => {
      if (e === null) {
        return;
      }
      if (e === ENABLED) {
        const allRows = serverList
          .filter(
            (item) =>
              zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c === true,
          )
          .map((item) => ({
            id: item?.id ?? '',
            columns: [
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" size="small" weight="regular" key={item?.id} color="gray0">
                  {item?.name}
                </ds-text>
              </Container>,
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" key={item?.id}>
                  {zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c ? (
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
        setServerTableRows(allRows);
      }
      if (e === DISABLED) {
        const allRows = serverList
          .filter(
            (item) => !zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c,
          )
          .map((item) => ({
            id: item?.id ?? '',
            columns: [
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" size="small" weight="regular" key={item?.id} color="gray0">
                  {item?.name}
                </ds-text>
              </Container>,
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" key={item?.id}>
                  {zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c ? (
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
        setServerTableRows(allRows);
      }
    },
    [t, serverList, zimbraMailHostPoolList],
  );

  const tableHeader = useMemo<Array<THeader>>(
    () => [
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
          const value = selected[0]?.value;
          if (value) {
            onFilterApply(value);
          }
        },
      },
    ],
    [t, onFilterApply],
  );

  const onDisable = useCallback(() => {
    setOpenConfirmDialog(true);
  }, []);

  const onModifyCOS = useCallback(
    (body: ModifyCosBody) => {
      modifyCos(body)
        .then((data) => {
          const cos = data?.cos[0];
          if (cos) {
            flushCache('cos', 'id', body.id._content);
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
            setCos(cos);
          }
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
    },
    [createSnackbar, t, setCos],
  );

  const onEnable = useCallback(() => {
    const body: ModifyCosBody = {
      _jsns: ZIMBRA_ADMIN_URN,
      a: [
        ...zimbraMailHostPoolList.map((item) => ({
          n: 'zimbraMailHostPool',
          _content: item?._content,
        })),
        {
          n: 'zimbraMailHostPool',
          _content: selectedTableRows[0]?.id ?? '',
        },
      ],
      id: {
        _content: cosId as string,
      },
    };
    onModifyCOS(body);
  }, [selectedTableRows, onModifyCOS, zimbraMailHostPoolList, cosId]);

  const onDisableServer = useCallback(() => {
    const allServers = zimbraMailHostPoolList.filter(
      (item) => item?._content !== selectedTableRows[0]?.id,
    );
    const attributes: Attribute[] =
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
  }, [selectedTableRows, zimbraMailHostPoolList, onModifyCOS, cosId]);

  const hideConfirmDialog = useCallback(() => {
    setOpenConfirmDialog(false);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchServerLists = useCallback(
    debounce((searchText: string, serverListItems: Array<ServerItem>) => {
      if (searchText !== '') {
        const allRows = serverListItems
          .filter((item) => item?.name?.includes(searchText))
          .map((item) => ({
            id: item?.id ?? '',
            columns: [
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" size="small" weight="regular" key={item?.id} color="gray0">
                  {item?.name}
                </ds-text>
              </Container>,
              <Container
                crossAlignment="flex-start"
                key={item?.id}
                style={{ cursor: 'pointer' }}
                onClick={(ev: React.MouseEvent): void => {
                  ev.stopPropagation();
                  setSelectedTableRows([item]);
                  setSelectedTableRowsId([item?.id ?? '']);
                }}
              >
                <ds-text as="span" key={item?.id}>
                  {zimbraMailHostPoolList.find((sp) => item?.id === sp?._content)?.c ? (
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
        setServerTableRows(allRows);
      }
    }, 700),
    [debounce],
  );

  useEffect(() => {
    searchServerLists(searchServer, serverList);
  }, [searchServer, searchServerLists, serverList]);

  useEffect(() => {
    if (zimbraMailHostPoolList && serverList.length > 0) {
      if (
        zimbraMailHostPoolList.length ===
        zimbraMailHostPoolList.filter((item) => !item?.c).length
      ) {
        setZimbraMailHostPool(false);
      }
    }
  }, [zimbraMailHostPoolList, serverList]);

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
                value={zimbraMailHostPool}
                label={t(
                  'cos.limt_serverpool_avaiable_create_user',
                  'Limit server pool available for creating new users in this COS',
                )}
                onClick={(): void => {
                  setZimbraMailHostPool(!zimbraMailHostPool);
                }}
                iconColor="primary"
              />
            </Padding>
          </ListRow>
          {zimbraMailHostPool && (
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
                          (serverTableRows.length === 0 && searchServer.length === 0) || readonlyCOS
                        }
                        label={t('cos.search_a_specific_server', 'Search for a specific server')}
                        CustomIcon={(): ReactElement => (
                          <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
                        )}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                          setSearchServer(e.target.value);
                        }}
                      />
                    </Row>
                    <Row padding={{ all: 'small' }} width="35%">
                      <Padding left="small" right="large">
                        <Button
                          type="outlined"
                          key="add-button"
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
                        key="add-button"
                        label={t('label.disable', 'disable')}
                        color="error"
                        icon="CloseCircleOutline"
                        iconPlacement="right"
                        size="extralarge"
                        disabled={!disable || readonlyCOS}
                        onClick={onDisable}
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
                onClick={hideConfirmDialog}
              />
            </Container>

            <Container orientation="horizontal" mainAlignment="flex-end" width="75%">
              <Padding all="small">
                <Button
                  label={t('label.no_go_back', 'No, Go Back')}
                  color="secondary"
                  onClick={hideConfirmDialog}
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
              serverName: serverList.find((sp) => sp?.id === selectedTableRows[0])?.name,
              defaultValue:
                'You are disabling pool on {{serverName}}. All mailboxes will be not moved. Are you sure you want to delete it?',
            })}
          </ds-text>
        </Padding>
      </Modal>
    </PageLayout>
  );
};

export default CosServerPools;
