/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  Input,
  Padding,
  Row,
  Table,
} from '@zextras/ui-components';
import { format } from 'date-fns';
import { type ChangeEvent, type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../assets/gardian.svg';
import { useSelectedDomain } from '../../../../hooks/use-selected-domain';
import type { MobileDevice } from '../../../../services/parse-active-sync';
import { useActiveSyncDevices, useRemoveDevice } from '../../../../services/use-active-sync';
import { ActiveDeviceDetail } from './active-device-detail';

const SearchFunnelIcon = (): ReactElement => (
  <ds-icon icon="FunnelOutline" size="large" color="primary"></ds-icon>
);

type DeviceTableCellProps = {
  onActivate: () => void;
  children: ReactNode;
};

function DeviceTableCell({ onActivate, children }: Readonly<DeviceTableCellProps>) {
  return (
    <Container
      crossAlignment="flex-start"
      onClick={(event: { stopPropagation: () => void }): void => {
        event.stopPropagation();
        onActivate();
      }}
    >
      <ds-text as="span" size="small" weight="light" color="gray0">
        {children}
      </ds-text>
    </Container>
  );
}

function filterDevices(devices: Array<MobileDevice>, searchText: string): Array<MobileDevice> {
  if (!searchText) return devices;
  const query = searchText.toLowerCase();
  return devices.filter(
    (item) =>
      item.accountName.toLowerCase().includes(query) ||
      item.status.toString().toLowerCase().includes(query) ||
      item.deviceType.toLowerCase().includes(query),
  );
}

export const ActiveSync = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name ?? '';
  const { data: devices = [], isFetching, isError } = useActiveSyncDevices(domainName);
  const removeDevice = useRemoveDevice();

  const [searchString, setSearchString] = useState('');
  const [filteredDevices, setFilteredDevices] = useState<Array<MobileDevice>>([]);
  const [checkedFirstSeen, setCheckedFirstSeen] = useState<number | null>(null);
  const [detailDevice, setDetailDevice] = useState<MobileDevice | null>(null);

  useEffect(() => {
    if (!searchString) {
      setFilteredDevices(devices);
      return;
    }
    const handle = setTimeout(() => {
      setFilteredDevices(filterDevices(devices, searchString));
    }, 700);
    return () => clearTimeout(handle);
  }, [searchString, devices]);

  useEffect(() => {
    setCheckedFirstSeen(null);
  }, [searchString]);

  const checkedDevice =
    checkedFirstSeen === null
      ? undefined
      : filteredDevices.find((item) => item.firstSeen === checkedFirstSeen);

  const headers = [
    { id: 'name', label: t('label.device', 'Device'), width: '10%', bold: true },
    { id: 'device_id', label: t('label.device_id', 'Device ID'), width: '15%', bold: true },
    { id: 'account', label: t('label.account', 'Account'), width: '15%', bold: true },
    { id: 'last_seen', label: t('label.last_seen', 'Last seen'), width: '20%', bold: true },
    { id: 'eas', label: t('label.eas', 'EAS'), width: '15%', bold: true },
    { id: 'status', label: t('label.status', 'Status'), width: '15%', bold: true },
  ];

  const tableRows = filteredDevices.map((item) => {
    const onActivate = (): void => {
      setCheckedFirstSeen(item.firstSeen);
      setDetailDevice(item);
    };
    return {
      id: String(item.firstSeen),
      columns: [
        <DeviceTableCell key={`name-${item.deviceId}`} onActivate={onActivate}>
          {item.accountName}
        </DeviceTableCell>,
        <DeviceTableCell key={`id-${item.deviceId}`} onActivate={onActivate}>
          {item.deviceId}
        </DeviceTableCell>,
        <DeviceTableCell key={`email-${item.deviceId}`} onActivate={onActivate}>
          {item.accountEmail}
        </DeviceTableCell>,
        <DeviceTableCell key={`seen-${item.deviceId}`} onActivate={onActivate}>
          {format(new Date(item.lastSeen), 'yy/MM/dd | hh:mm:ss a')}
        </DeviceTableCell>,
        <DeviceTableCell key={`eas-${item.deviceId}`} onActivate={onActivate}>
          {''}
        </DeviceTableCell>,
        <DeviceTableCell key={`status-${item.deviceId}`} onActivate={onActivate}>
          {item.status === 1 ? t('label.enabled', 'Enabled') : t('label.disabled', 'Disabled')}
        </DeviceTableCell>,
      ],
    };
  });

  const selectedRows: [] | [string] =
    checkedFirstSeen === null ? [] : [String(checkedFirstSeen)];

  function onRemoveDevice(): void {
    if (!checkedDevice) return;
    removeDevice.mutate(
      { accountName: checkedDevice.accountEmail, deviceId: checkedDevice.deviceId },
      {
        onSuccess: () => {
          setCheckedFirstSeen(null);
          if (detailDevice?.firstSeen === checkedDevice.firstSeen) {
            setDetailDevice(null);
          }
        },
      },
    );
  }

  return (
    <Container padding={{ all: 'large' }} background="gray6" mainAlignment="flex-start">
      <Container
        orientation="column"
        background="gray6"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
      >
        <Row mainAlignment="flex-start" width="100%">
          <Container orientation="vertical" mainAlignment="space-around" height="3.625rem">
            <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
              <Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
                <ds-text as="h1" size="medium" weight="bold" color="gray0">
                  {t('label.active_sync', 'ActiveSync')}
                </ds-text>
              </Row>
              <Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end"></Row>
            </Row>
          </Container>
        </Row>
        <Row orientation="horizontal" width="100%" background="gray6">
          <ds-divider></ds-divider>
        </Row>
        <Container
          orientation="column"
          background="gray6"
          crossAlignment="flex-start"
          mainAlignment="flex-start"
          height="calc(100% - 70px)"
          style={{ position: 'relative', overflow: 'auto' }}
          padding={{ all: 'large' }}
        >
          <Row mainAlignment="flex-start" width="100%" wrap="nowrap">
            <Container width="88%" crossAlignment="flex-start" mainAlignment="flex-start">
              <Input
                disabled={tableRows.length === 0 && searchString.length === 0 && !isError}
                label={t(
                  'label.filter_by_device_type_account',
                  'Filter by device type, account, status',
                )}
                backgroundColor="gray5"
                onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                  setSearchString(e.target.value);
                }}
                CustomIcon={SearchFunnelIcon}
              />
            </Container>
            <Container width="12%" crossAlignment="flex-end" mainAlignment="flex-end">
              <Padding left="medium">
                <Button
                  type="outlined"
                  label={t('label.remove', 'Remove')}
                  color="error"
                  disabled={selectedRows.length === 0 || removeDevice.isPending || isFetching}
                  size="extralarge"
                  onClick={onRemoveDevice}
                  loading={removeDevice.isPending}
                />
              </Padding>
            </Container>
          </Row>
          <Row
            orientation="horizontal"
            mainAlignment="space-between"
            crossAlignment="flex-start"
            padding={{ top: 'large' }}
            width="fill"
            style={{ position: 'relative' }}
          >
            <Table
              rows={tableRows}
              headers={headers}
              showCheckbox
              multiSelect={false}
              selectedRows={selectedRows}
              onSelectionChange={(selected: Array<string>): void => {
                setCheckedFirstSeen(selected[0] === undefined ? null : Number(selected[0]));
              }}
              RowFactory={HoverableRowFactory}
              HeaderFactory={CustomHeaderFactory}
            />
            {tableRows.length === 0 && (
              <Container orientation="column" crossAlignment="center" mainAlignment="center">
                <Row padding={{ top: 'extralarge' }}>
                  <img src={logo} alt="logo" />
                </Row>
                <Row
                  padding={{ top: 'extralarge' }}
                  orientation="vertical"
                  crossAlignment="center"
                  style={{ textAlign: 'center' }}
                >
                  <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                    {t('label.this_list_is_empty', 'This list is empty.')}
                  </ds-text>
                </Row>
                <Row
                  orientation="vertical"
                  crossAlignment="center"
                  style={{ textAlign: 'center' }}
                  padding={{ top: 'small' }}
                  width="53%"
                >
                  <ds-text as="p" weight="light" color="#828282" size="large" overflow="break-word">
                    <Trans
                      i18nKey="label.do_you_need_more_information"
                      defaults="Do you need more information?"
                    />
                  </ds-text>
                </Row>
                <Row
                  orientation="vertical"
                  crossAlignment="center"
                  style={{ textAlign: 'center' }}
                  padding={{ top: 'small', bottom: 'small' }}
                  width="53%"
                >
                  <ds-text as="p" weight="light" color="primary">
                    {t('label.click_here', 'Click here')}
                  </ds-text>
                </Row>
              </Container>
            )}
          </Row>
        </Container>
      </Container>
      {detailDevice && (
        <ActiveDeviceDetail
          selectedDevice={detailDevice}
          onClose={() => setDetailDevice(null)}
        />
      )}
    </Container>
  );
};

export default ActiveSync;
