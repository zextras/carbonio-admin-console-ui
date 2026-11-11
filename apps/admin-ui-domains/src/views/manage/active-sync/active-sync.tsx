/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  CustomHeaderFactory,
  HoverableRowFactory,
  LegacyInput,
  ModalOverlay,
  Table,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { format } from 'date-fns';
import {
  type ChangeEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import type { MobileDevice } from '../../../services/parse-active-sync';
import { useActiveSyncDevices, useRemoveDevice } from '../../../services/use-active-sync';
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
    <button
      type="button"
      className="flex w-full flex-col items-start border-0 bg-transparent p-0 text-left"
      onClick={(event: MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        onActivate();
      }}
    >
      <ds-text as="span" size="small" weight="light" color="gray0">
        {children}
      </ds-text>
    </button>
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

function deviceRowId(device: MobileDevice): string {
  return `${device.deviceId}/${device.accountEmail}`;
}

export const ActiveSync = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainName = domain?.name ?? '';
  const { data: devices = [], isFetching, isError } = useActiveSyncDevices(domainName);
  const removeDevice = useRemoveDevice();

  const [searchString, setSearchString] = useState('');
  const [checkedDeviceId, setCheckedDeviceId] = useState<string | null>(null);
  const [detailDevice, setDetailDevice] = useState<MobileDevice | null>(null);

  const debouncedSearch = useDebouncedValue(searchString, 700);
  const filteredDevices = filterDevices(devices, debouncedSearch);

  const checkedDevice =
    checkedDeviceId === null
      ? undefined
      : filteredDevices.find((item) => deviceRowId(item) === checkedDeviceId);

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
      setCheckedDeviceId(deviceRowId(item));
      setDetailDevice(item);
    };
    return {
      id: deviceRowId(item),
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

  const selectedRows: [] | [string] = checkedDeviceId === null ? [] : [checkedDeviceId];

  function onRemoveDevice(): void {
    if (!checkedDevice) return;
    removeDevice.mutate(
      { accountName: checkedDevice.accountEmail, deviceId: checkedDevice.deviceId },
      {
        onSuccess: () => {
          setCheckedDeviceId(null);
          if (detailDevice && deviceRowId(detailDevice) === deviceRowId(checkedDevice)) {
            setDetailDevice(null);
          }
        },
      },
    );
  }

  return (
    <div className="box-border flex h-full w-full flex-col justify-start bg-gray6 p-lg">
      <div className="flex h-[3.625rem] w-full items-center p-lg">
        <ds-text as="h1" size="medium" weight="bold" color="gray0">
          {t('label.active_sync', 'ActiveSync')}
        </ds-text>
      </div>
      <div className="relative flex w-full flex-col overflow-auto bg-gray6 p-lg">
        <ds-divider></ds-divider>
        <div className="flex w-full flex-nowrap justify-start pt-lg">
          <div className="flex w-[88%] flex-col items-start">
            <LegacyInput
              disabled={tableRows.length === 0 && searchString.length === 0 && !isError}
              label={t(
                'label.filter_by_device_type_account',
                'Filter by device type, account, status',
              )}
              backgroundColor="gray5"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setSearchString(e.target.value);
                setCheckedDeviceId(null);
              }}
              CustomIcon={SearchFunnelIcon}
            />
          </div>
          <div className="flex w-[12%] flex-col items-end justify-end pl-md">
            <Button
              type="outlined"
              label={t('label.remove', 'Remove')}
              color="error"
              disabled={selectedRows.length === 0 || removeDevice.isPending || isFetching}
              size="extralarge"
              onClick={onRemoveDevice}
              loading={removeDevice.isPending}
            />
          </div>
        </div>
        <div className="relative flex w-full flex-wrap items-start justify-between pt-lg">
          <Table
            rows={tableRows}
            headers={headers}
            showCheckbox
            multiSelect={false}
            selectedRows={selectedRows}
            onSelectionChange={(selected: Array<string>): void => {
              setCheckedDeviceId(selected[0] ?? null);
            }}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
          {tableRows.length === 0 && (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <img className="pt-xl" src={logo} alt="logo" />
              <ds-text
                className="pt-xl text-center"
                as="p"
                weight="light"
                color="#828282"
                size="large"
                overflow="break-word"
              >
                {t('label.this_list_is_empty', 'This list is empty.')}
              </ds-text>
              <ds-text
                className="w-[53%] pt-sm text-center"
                as="p"
                weight="light"
                color="#828282"
                size="large"
                overflow="break-word"
              >
                <Trans
                  i18nKey="label.do_you_need_more_information"
                  defaults="Do you need more information?"
                />
              </ds-text>
              <ds-text
                className="w-[53%] pt-sm pb-sm text-center"
                as="p"
                weight="light"
                color="primary"
              >
                {t('label.click_here', 'Click here')}
              </ds-text>
            </div>
          )}
        </div>
      </div>
      {detailDevice && (
        <ModalOverlay open maxWidth="42.5rem">
          <ActiveDeviceDetail
            key={deviceRowId(detailDevice)}
            selectedDevice={detailDevice}
            onClose={() => setDetailDevice(null)}
          />
        </ModalOverlay>
      )}
    </div>
  );
};
