/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Row,
  Table,
  Tooltip,
} from '@zextras/ui-components';
import { useAllServers, useBackupServers, useIsAdvanced } from '@zextras/ui-shared';
import { isEmpty } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import type {
  BackupServerType,
  GetServerResponse,
  SmartScanTypeOption,
  StatusOption,
  TableHeader,
} from '../../../../types';
import { bytesToSize } from '../../utility/utils';

const SMART_SCAN_TYPE = {
  DISABLED: 1,
  ON_STARTUP_ONLY: 2,
  ON_STARTUP_AND_SCHEDULED: 3,
  SCHEDULED: 4,
} as const;

type BackupServersListTableProps = {
  serverList: Array<BackupServerType>;
};

const BackupServersListTable = ({ serverList }: BackupServersListTableProps) => {
  const [t] = useTranslation();
  const headers: Array<TableHeader> = [
    {
      id: 'server',
      label: t('label.server', 'Server'),
      width: '20%',
      bold: true,
    },
    {
      id: 'backup_at_startup',
      label: t('label.backup_at_startup', 'Backup at Startup'),
      width: '12%',
      bold: true,
    },
    {
      id: 'rt_status',
      label: t('label.rt_status', 'RT Status'),
      width: '10%',
      bold: true,
    },
    {
      id: 'type',
      label: t('label.type', 'Type'),
      width: '5%',
      bold: true,
    },
    {
      id: 'smartscan',
      label: t('label.smartscan', 'Smartscan'),
      width: '10%',
      bold: true,
    },
    {
      id: 'purge',
      label: t('label.purge', 'Purge'),
      width: '8%',
      bold: true,
    },
    {
      id: 'description',
      label: t('label.description', 'Description'),
      width: '10%',
      bold: true,
    },
    {
      id: 'metadata_space',
      label: t('label.metadata_space', 'Metadata Space'),
      width: '10%',
      bold: true,
    },
    {
      id: 'backup_space',
      label: t('label.backup_space', 'Backup Space'),
      width: '10%',
      bold: true,
    },
  ];

  const tableRows = serverList.map((s, i) => ({
    id: i?.toString(),
    columns: [
      <ds-text as="span" size="small" weight="regular" key={s?.name} color="gray0">
        {s?.name}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={s?.name}
        color={s?.backupAtStartup ? 'gray0' : 'error'}
      >
        {s?.backupAtStartup ? s?.backupAtStartup : t('label.na', 'N/A')}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={s?.name}
        color={s?.rtStatus ? 'gray0' : 'error'}
      >
        {s?.rtStatus ? s?.rtStatus : t('label.na', 'N/A')}
      </ds-text>,
      <ds-text
        as="span"
        size="small"
        weight="light"
        key={s?.name}
        color={s?.type ? 'gray0' : 'error'}
      >
        {s?.type ? s?.type : t('label.na', 'N/A')}
      </ds-text>,
      <Tooltip
        placement="bottom"
        label={s?.smartScanTooltip ? s?.smartScanTooltip : t('label.na', 'N/A')}
        key={s?.name}
      >
        <ds-text as="span" size="small" weight="light" color={s?.smartScan ? 'gray0' : 'error'}>
          {s?.smartScan ? s?.smartScan : t('label.na', 'N/A')}
        </ds-text>
      </Tooltip>,
      <Tooltip
        placement="bottom"
        label={s?.purgeTooltip ? s?.purgeTooltip : t('label.na', 'N/A')}
        key={s?.name}
      >
        <ds-text as="span" size="small" weight="light" color={s?.purge ? 'gray0' : 'error'}>
          {s?.purge ? s?.purge : t('label.na', 'N/A')}
        </ds-text>
      </Tooltip>,
      <ds-text as="span" size="small" weight="light" key={s?.name} color="gray0">
        {s?.description}
      </ds-text>,
      <Row mainAlignment="flex-start" width="100%" key={s?.name}>
        <ds-icon icon="FolderOutline"></ds-icon>
        <Row padding={{ left: 'small' }}>
          <Tooltip
            placement="bottom"
            label={
              s?.availableMetadataSpaceTooltip
                ? s?.availableMetadataSpaceTooltip
                : t('label.na', 'N/A')
            }
          >
            <ds-text
              as="span"
              size="small"
              weight="light"
              color={s?.availableMetadataSpace ? 'gray0' : 'error'}
            >
              {s?.availableMetadataSpace ? s?.availableMetadataSpace : t('label.na', 'N/A')}
            </ds-text>
          </Tooltip>
        </Row>
      </Row>,
      <Row mainAlignment="flex-start" width="100%" key={s?.name}>
        <ds-icon icon="FolderOutline"></ds-icon>
        <Row padding={{ left: 'small' }}>
          <Tooltip
            placement="bottom"
            label={
              s?.availableBackupSpaceTooltip
                ? s?.availableBackupSpaceTooltip
                : t('label.na', 'N/A')
            }
          >
            <ds-text
              as="span"
              size="small"
              weight="light"
              color={s?.availableBackupSpace ? 'gray0' : 'error'}
            >
              {s?.availableBackupSpace ? s?.availableBackupSpace : t('label.na', 'N/A')}
            </ds-text>
          </Tooltip>
        </Row>
      </Row>,
    ],
    clickable: false,
  }));

  return (
    <Table
      headers={headers}
      rows={tableRows}
      showCheckbox={false}
      multiSelect={false}
      RowFactory={HoverableRowFactory}
      HeaderFactory={CustomHeaderFactory}
    />
  );
};

export const ServersList = () => {
  const [t] = useTranslation();
  const isAdvanced = useIsAdvanced();
  const { data: backupData } = useBackupServers({
    enabled: isAdvanced,
  });
  const { data: servers = [] } = useAllServers();
  const backupServerList = backupData?.backupServerList || [];

  const STATUS: Array<StatusOption> = [
    {
      label: t('label.scheduled', 'Scheduled'),
      value: true,
    },
    {
      label: t('label.disabled', 'Disabled'),
      value: false,
    },
  ];

  const TYPE: Array<StatusOption> = [
    {
      label: t('label.ext_volume', 'Ext. Volume'),
      value: true,
    },
    {
      label: t('label.local', 'Local'),
      value: false,
    },
  ];

  const smartScanType: Array<SmartScanTypeOption> = [
    {
      label: t('label.disabled', 'Disabled'),
      value: SMART_SCAN_TYPE.DISABLED,
    },
    {
      label: t('label.on_startup_only', 'On Startup Only'),
      value: SMART_SCAN_TYPE.ON_STARTUP_ONLY,
    },
    {
      label: t('label.on_startup_and_scheduled', 'On Startup & Scheduled'),
      value: SMART_SCAN_TYPE.ON_STARTUP_AND_SCHEDULED,
    },
    {
      label: t('label.scheduled', 'Scheduled'),
      value: SMART_SCAN_TYPE.SCHEDULED,
    },
  ];

  const getSmartScanStatus = (
    smartScanStartup: boolean,
    backupSmartScan: boolean,
  ): string => {
    if (smartScanStartup === false && backupSmartScan === false) {
      return smartScanType[0]?.label;
    }
    if (smartScanStartup === true && backupSmartScan === false) {
      return smartScanType[1]?.label;
    }
    if (smartScanStartup === true && backupSmartScan === true) {
      return smartScanType[2]?.label;
    }
    return smartScanType[3]?.label;
  };

  const getBackupServerValue = (
    backupServer: GetServerResponse,
  ): Partial<BackupServerType> => {
    const serverValue: Partial<BackupServerType> = {};
    if (backupServer) {
      const backupAtStartup = STATUS.find(
        (st) => st.value === backupServer?.attributes?.ZxBackup_ModuleEnabledAtStartup?.value,
      )?.label;
      const rtStatus = STATUS.find(
        (st) => st.value === backupServer?.attributes?.ZxBackup_RealTimeScanner?.value,
      )?.label;
      const type = isEmpty(backupServer?.attributes?.backupArchivingStore?.value)
        ? TYPE[1]?.label
        : TYPE[0]?.label;
      const purge = `${backupServer?.attributes?.ZxBackup_DataRetentionDays?.value}/${backupServer?.attributes?.backupAccountsRetentionDays?.value}`;

      const purgeTooltip = backupServer?.attributes?.backupPurgeScheduler?.value['cron-pattern'];
      const smartScanStartup = backupServer?.attributes?.ZxBackup_DoSmartScanOnStartup?.value;
      const backupSmartScan =
        backupServer?.attributes?.backupSmartScanScheduler?.value['cron-enabled'];
      const smartScan = getSmartScanStatus(smartScanStartup ?? false, backupSmartScan ?? false);
      const smartScanTooltip =
        backupServer?.attributes?.backupSmartScanScheduler?.value['cron-pattern'];
      const availableMetadataSpace = backupServer?.properties?.available_space_for_metadata
        ? bytesToSize(backupServer?.properties?.available_space_for_metadata)
        : '0 GB';
      const availableBackupSpace = backupServer?.properties?.available_space_for_blobs
        ? bytesToSize(backupServer?.properties?.available_space_for_blobs)
        : '0 GB';
      const availableBackupSpaceTooltip = backupServer?.properties?.available_space_for_blobs
        ? backupServer?.attributes?.ZxBackup_DestPath?.value
        : undefined;
      const availableMetadataSpaceTooltip = backupServer?.attributes?.ZxBackup_DestPath?.value;
      return {
        backupAtStartup,
        rtStatus,
        type,
        purge,
        purgeTooltip,
        smartScan,
        smartScanTooltip,
        availableBackupSpace,
        availableMetadataSpace,
        availableBackupSpaceTooltip,
        availableMetadataSpaceTooltip,
      };
    }
    return serverValue;
  };

  const serverList: Array<BackupServerType> = servers.length > 0
    ? servers.map((item) => {
        const id = item?.id ?? '';
        const name = item?.name ?? '';
        const description =
          item?.a?.filter((value) => value.n === 'description')[0]?._content ?? '';
        if (backupServerList && backupServerList.length > 0) {
          const backupServerItem = backupServerList.filter(
            (backupItem: Record<string, unknown>) => backupItem[id],
          )[0];
          if (backupServerItem) {
            const zxBackItem = (
              backupServerItem as Record<string, Record<string, GetServerResponse>>
            )[id];
            if (zxBackItem && zxBackItem?.ZxBackup) {
              const backupValues = getBackupServerValue(zxBackItem?.ZxBackup);
              return { id, name, description, ...backupValues };
            }
          }
        }
        return { id, name, description };
      })
    : [];

  return (
    <>
      <Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
        <Row mainAlignment="flex-start" width="100%">
          <Container
            orientation="vertical"
            mainAlignment="space-around"
            background="gray6"
            height="58px"
          >
            <Row
              orientation="horizontal"
              width="100%"
              padding={{ all: 'extrasmall' }}
              crossAlignment="flex-start"
              mainAlignment="flex-start"
            >
              <Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
                <ds-text as="h2" size="medium" weight="bold" color="gray0">
                  {t('label.server_list', 'Server List')}
                </ds-text>
              </Row>
            </Row>
          </Container>
          <Row orientation="horizontal" width="100%" background="gray6">
            <ds-divider></ds-divider>
          </Row>
        </Row>
        <Container
          orientation="column"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          style={{ overflow: 'auto' }}
          width="100%"
          height="calc(100vh - 200px)"
          padding={{ top: 'large', left: 'small', right: 'small' }}
        >
          <Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
            <BackupServersListTable serverList={serverList} />
          </Row>
        </Container>
      </Container>
    </>
  );
};
