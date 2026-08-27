/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Button,
  Container,
  Displayer,
  LabeledValue,
  ListRow,
  Row,
  Select,
} from '@zextras/ui-components';
import { useStickyBarStore } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RESET_DEVICE, WIPE_DEVICE } from '../../../../constants';
import type { MobileDevice } from '../../../../services/parse-active-sync';
import {
  useActiveSyncDeviceStats,
  useResetDevice,
  useSuspendDevice,
  useWipeDevice,
} from '../../../../services/use-active-sync';
import { ActiveDeviceConfirmation } from './active-device-confirmation';

type SelectOption = { label: string; value: number };

type ActiveDeviceDetailProps = {
  selectedDevice: MobileDevice;
  onClose: () => void;
};

export const ActiveDeviceDetail = ({
  selectedDevice,
  onClose,
}: Readonly<ActiveDeviceDetailProps>) => {
  const [t] = useTranslation();
  const { isSticky, setIsSticky } = useStickyBarStore();
  const [operationType, setOperationType] = useState<string>('');
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  const { data: mobileDeviceDetail, isFetching } = useActiveSyncDeviceStats({
    accountEmail: selectedDevice.accountEmail,
    deviceId: selectedDevice.deviceId,
    accountServer: selectedDevice.accountServer,
  });

  const wipeDevice = useWipeDevice();
  const resetDevice = useResetDevice();
  const suspendDevice = useSuspendDevice();
  const isOperationPending =
    wipeDevice.isPending || resetDevice.isPending || suspendDevice.isPending;

  const abqStatusOptions: Array<SelectOption> = [
    { label: t('label.allowed', 'Allowed'), value: 1 },
    { label: t('label.blocked', 'Blocked'), value: 2 },
    { label: t('label.quarantined', 'Quarantined'), value: 3 },
  ];
  const statusOptions: Array<SelectOption> = [
    { label: t('label.can_receive', 'Can receive'), value: 1 },
    { label: t('label.can_not_receiver', 'Can`t receiver'), value: 0 },
  ];

  const [abqStatus, setAbqStatus] = useState<SelectOption>(abqStatusOptions[0]);
  const [status, setStatus] = useState<SelectOption>(statusOptions[0]);

  useEffect(() => {
    if (mobileDeviceDetail?.status === 1) {
      setStatus(statusOptions[0]);
    } else if (mobileDeviceDetail) {
      setStatus(statusOptions[1]);
    }
  }, [mobileDeviceDetail]);

  function closeConfirm(): void {
    setOperationType('');
    setWipeConfirmed(false);
  }

  function runConfirmedAction(): void {
    const accountName = mobileDeviceDetail?.accountName ?? selectedDevice.accountName;
    const deviceId = mobileDeviceDetail?.deviceId ?? selectedDevice.deviceId;
    if (operationType === RESET_DEVICE) {
      resetDevice.mutate(
        { accountName, deviceId },
        {
          onSuccess: () => {
            closeConfirm();
            onClose();
          },
        },
      );
      return;
    }
    if (operationType === WIPE_DEVICE) {
      wipeDevice.mutate(
        { accountName, deviceId, confirm: wipeConfirmed },
        {
          onSuccess: () => {
            closeConfirm();
            onClose();
          },
        },
      );
    }
  }

  function suspendNow(): void {
    const accountName = mobileDeviceDetail?.accountName ?? selectedDevice.accountName;
    const deviceId = mobileDeviceDetail?.deviceId ?? selectedDevice.deviceId;
    suspendDevice.mutate({ accountName, deviceId }, { onSuccess: onClose });
  }

  const buttons = [
    {
      align: 'right' as const,
      label: t('label.wipe_device', 'Wipe Device'),
      tooltiplabel: t(
        'label.wipe_device_factory_settings',
        'Wipe the device to the factory settings',
      ),
      loading: isFetching,
      disable: isFetching,
      onClick: (): void => setOperationType(WIPE_DEVICE),
    },
    {
      align: 'right' as const,
      label: t('label.reset_device', 'Reset Device'),
      tooltiplabel: t('label.logoff_from_every_device', 'Log off from every device'),
      color: 'primary',
      onClick: (): void => setOperationType(RESET_DEVICE),
      loading: isFetching,
      disable: isFetching,
    },
    {
      align: 'right' as const,
      color: 'primary',
      label: t('label.suspend', 'Suspend'),
      tooltiplabel: t('label.active_sync_active_paused', 'The activesync is active / paused'),
      onClick: suspendNow,
      loading: isFetching || isOperationPending,
      disable: isFetching || isOperationPending,
    },
    {
      align: 'left' as const,
      icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
      onClick: (): void => setIsSticky(!isSticky),
    },
  ];

  return (
    <Container
      background="gray6"
      mainAlignment="flex-start"
      style={{
        zIndex: '10',
        position: 'absolute',
        top: '2.688rem',
        right: '0',
        bottom: '0',
        left: 'max(calc(100% - 42.5rem), 0.75rem)',
        transition: 'left 0.2s ease-in-out',
        height: 'auto',
        width: 'auto',
        maxHeight: '100%',
        overflow: 'hidden',
        boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="3.5rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          {selectedDevice.accountName}
        </Row>
        <Row padding={{ right: 'extrasmall' }}>
          <Button
            type="ghost"
            color="text"
            size="medium"
            icon="CloseOutline"
            aria-label={t('label.close', 'Close')}
            onClick={onClose}
          />
        </Row>
      </Row>
      <ds-divider></ds-divider>
      <ListRow>
        <Displayer buttons={buttons} pinIcon={isSticky} />
      </ListRow>
      <Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ all: 'large' }}>
        <ListRow>
          <Row padding={{ top: 'large' }}>
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {t('label.status_lbl', 'Status')}
            </ds-text>
          </Row>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <Select
              items={abqStatusOptions}
              background="gray5"
              label={t('label.abq_status', 'ABQ Status')}
              showCheckbox={false}
              selection={abqStatus}
              onChange={(ev: string | number | null): void => {
                const dataItem = abqStatusOptions.find((item) => item.value === ev);
                if (dataItem) setAbqStatus(dataItem);
              }}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Row padding={{ top: 'large' }}>
            <ds-text as="h3" size="medium" weight="bold" color="gray0">
              {t('label.account', 'Account')}
            </ds-text>
          </Row>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <LabeledValue
              label={t('label.server', 'Server')}
              backgroundColor="gray5"
              value={mobileDeviceDetail?.accountServer}
            />
          </Container>
          <Container padding={{ top: 'large', left: 'extralarge' }}>
            <LabeledValue
              label={t('label.e_mail', 'E-mail')}
              backgroundColor="gray5"
              value={mobileDeviceDetail?.accountEmail}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <Select
              items={statusOptions}
              background="gray5"
              label={t('label.status_lbl', 'Status')}
              showCheckbox={false}
              selection={status}
              onChange={(ev: string | number | null): void => {
                const dataItem = statusOptions.find((item) => item.value === ev);
                if (dataItem) setStatus(dataItem);
              }}
            />
          </Container>
          <Container padding={{ top: 'large', left: 'extralarge' }}>
            <LabeledValue
              label={t('label.mobile_password', 'Mobile Password')}
              backgroundColor="gray5"
              value={
                mobileDeviceDetail?.hasMobilePassword
                  ? t('label.true', 'True')
                  : t('label.false', 'False')
              }
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <LabeledValue
              label={t('label.device_id', 'Device ID')}
              backgroundColor="gray5"
              value={mobileDeviceDetail?.deviceId}
            />
          </Container>
          <Container padding={{ top: 'large', left: 'extralarge' }}>
            <LabeledValue
              label={t('label.device', 'Device')}
              backgroundColor="gray5"
              value={mobileDeviceDetail?.deviceType}
            />
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <LabeledValue
              label={t('label.user_agent', 'User Agent')}
              backgroundColor="gray5"
              value={mobileDeviceDetail?.userAgent}
            />
          </Container>
          <Container padding={{ top: 'large', left: 'extralarge' }}>
            <LabeledValue label={t('label.eas', 'EAS')} backgroundColor="gray5" value={''} />
          </Container>
        </ListRow>
        <ListRow>
          <Container padding={{ top: 'large' }}>
            <LabeledValue
              label={t('label.registration', 'Registration')}
              backgroundColor="gray5"
              value={''}
            />
          </Container>
          <Container padding={{ top: 'large', left: 'extralarge' }}>
            <LabeledValue
              label={t('label.last_access', 'Last Access')}
              backgroundColor="gray5"
              value={
                mobileDeviceDetail?.lastSeen
                  ? format(new Date(mobileDeviceDetail.lastSeen), 'yy/MM/dd | hh:mm:ss a')
                  : ''
              }
            />
          </Container>
        </ListRow>
        {operationType !== '' && mobileDeviceDetail && (
          <ActiveDeviceConfirmation
            operationType={operationType}
            device={mobileDeviceDetail}
            isPending={isOperationPending}
            onClose={closeConfirm}
            onConfirm={runConfirmedAction}
            onWipeAcknowledged={setWipeConfirmed}
          />
        )}
      </Container>
    </Container>
  );
};

export default ActiveDeviceDetail;
