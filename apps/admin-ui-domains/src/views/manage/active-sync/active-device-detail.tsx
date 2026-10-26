/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  Displayer,
  FormPageLayout,
  LabeledValue,
  Select,
  useSnackbar,
} from '@zextras/ui-components';
import { useStickyBarStore } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RESET_DEVICE, WIPE_DEVICE } from '../../../constants';
import type {
  AbqDeviceStatus,
  MobileDevice,
  MobileDeviceDetail,
} from '../../../services/parse-active-sync';
import {
  useAbqDevices,
  useActiveSyncDeviceStats,
  useResetDevice,
  useResumeDevice,
  useSetAbqDeviceStatus,
  useSuspendDevice,
  useWipeDevice,
} from '../../../services/use-active-sync';
import { ActiveDeviceConfirmation } from './active-device-confirmation';
import styles from './active-device-detail.module.css';

type AbqStatusOption = { label: string; value: AbqDeviceStatus };

type DeviceStatusOption = { label: string; value: 0 | 1 };

type DeviceEditFormValues = {
  abqStatus: AbqDeviceStatus;
  statusValue: 0 | 1;
};

type ActiveDeviceDetailProps = {
  selectedDevice: MobileDevice;
  onClose: () => void;
};

type ActiveDeviceDetailFormProps = {
  device: MobileDeviceDetail;
  serverAbqStatus: AbqDeviceStatus;
  serverStatusValue: 0 | 1;
  isStatsFetching: boolean;
  onClose: () => void;
};

type PanelShellProps = {
  onClose: () => void;
  children: ReactNode;
};

function PanelShell({ onClose, children }: Readonly<PanelShellProps>) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <div className={styles.closeBar}>
        <Button
          type="ghost"
          color="text"
          size="medium"
          icon="CloseOutline"
          aria-label={t('label.close', 'Close')}
          onClick={onClose}
        />
      </div>
      {children}
    </div>
  );
}

function LoadingPanelBody() {
  return (
    <div className={styles.loadingBody}>
      <ds-spinner></ds-spinner>
    </div>
  );
}

export const ActiveDeviceDetail = ({
  selectedDevice,
  onClose,
}: Readonly<ActiveDeviceDetailProps>) => {
  const statsQuery = useActiveSyncDeviceStats({
    accountEmail: selectedDevice.accountEmail,
    deviceId: selectedDevice.deviceId,
    accountServer: selectedDevice.accountServer,
  });
  const abqQuery = useAbqDevices();

  const serverAbqStatus: AbqDeviceStatus =
    (abqQuery.data ?? []).find((device) => device.deviceId === selectedDevice.deviceId)?.status ??
    'allowed';
  const serverStatusValue: 0 | 1 = statsQuery.data?.status === 1 ? 1 : 0;
  const isDataLoading = statsQuery.isPending || abqQuery.isPending;

  return (
    <PanelShell onClose={onClose}>
      {isDataLoading && <LoadingPanelBody />}
      {!isDataLoading && statsQuery.data && (
        <ActiveDeviceDetailForm
          device={statsQuery.data}
          serverAbqStatus={serverAbqStatus}
          serverStatusValue={serverStatusValue}
          isStatsFetching={statsQuery.isFetching}
          onClose={onClose}
        />
      )}
    </PanelShell>
  );
};

const ActiveDeviceDetailForm = ({
  device,
  serverAbqStatus,
  serverStatusValue,
  isStatsFetching,
  onClose,
}: Readonly<ActiveDeviceDetailFormProps>) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { isSticky, setIsSticky } = useStickyBarStore();
  const [operationType, setOperationType] = useState<string>('');
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  const wipeDevice = useWipeDevice();
  const resetDevice = useResetDevice();
  const suspendDevice = useSuspendDevice();
  const setAbqDeviceStatus = useSetAbqDeviceStatus();
  const resumeDevice = useResumeDevice();
  const isOperationPending =
    wipeDevice.isPending || resetDevice.isPending || suspendDevice.isPending;

  const abqStatusOptions: Array<AbqStatusOption> = [
    { label: t('label.allowed', 'Allowed'), value: 'allowed' },
    { label: t('label.blocked', 'Blocked'), value: 'blocked' },
    { label: t('label.quarantined', 'Quarantined'), value: 'quarantined' },
  ];
  const statusOptions: Array<DeviceStatusOption> = [
    { label: t('label.can_receive', 'Can receive'), value: 1 },
    { label: t('label.can_not_receiver', 'Can`t receiver'), value: 0 },
  ];

  const form = useForm({
    defaultValues: {
      abqStatus: serverAbqStatus,
      statusValue: serverStatusValue,
    } as DeviceEditFormValues,
    onSubmit: async ({ value }) => {
      const requests: Array<Promise<unknown>> = [];
      if (value.abqStatus !== serverAbqStatus) {
        requests.push(
          setAbqDeviceStatus.mutateAsync({
            deviceId: device.deviceId,
            account: device.accountEmail,
            status: value.abqStatus,
          }),
        );
      }
      if (value.statusValue !== serverStatusValue) {
        requests.push(
          value.statusValue === 0
            ? suspendDevice.mutateAsync({
                accountName: device.accountName,
                deviceId: device.deviceId,
              })
            : resumeDevice.mutateAsync({
                accountName: device.accountName,
                deviceId: device.deviceId,
              }),
        );
      }

      const results = await Promise.allSettled(requests);
      const failure = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      );
      if (failure) {
        // A successful save in the same batch shows its snackbar after the
        // failed one and replaces it — re-raise the failure here so the final
        // visible feedback is accurate for a partially-failed save.
        createSnackbar({
          key: 'error',
          severity: 'error',
          label:
            failure.reason instanceof Error
              ? failure.reason.message
              : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }
      form.reset(value, { keepDefaultValues: true });
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);
  const abqStatus = useSelector(form.store, (s) => s.values.abqStatus);
  const statusValue = useSelector(form.store, (s) => s.values.statusValue);
  const selectedAbqOption =
    abqStatusOptions.find((option) => option.value === abqStatus) ?? abqStatusOptions[0];
  const selectedStatusOption =
    statusOptions.find((option) => option.value === statusValue) ?? statusOptions[0];

  function closeConfirm(): void {
    setOperationType('');
    setWipeConfirmed(false);
  }

  function runConfirmedAction(): void {
    if (operationType === RESET_DEVICE) {
      resetDevice.mutate(
        { accountName: device.accountName, deviceId: device.deviceId },
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
        { accountName: device.accountName, deviceId: device.deviceId, confirm: wipeConfirmed },
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
    suspendDevice.mutate(
      { accountName: device.accountName, deviceId: device.deviceId },
      { onSuccess: onClose },
    );
  }

  const buttons = [
    {
      align: 'right' as const,
      label: t('label.wipe_device', 'Wipe Device'),
      tooltiplabel: t(
        'label.wipe_device_factory_settings',
        'Wipe the device to the factory settings',
      ),
      loading: isStatsFetching,
      disable: isStatsFetching,
      onClick: (): void => setOperationType(WIPE_DEVICE),
    },
    {
      align: 'right' as const,
      label: t('label.reset_device', 'Reset Device'),
      tooltiplabel: t('label.logoff_from_every_device', 'Log off from every device'),
      color: 'primary',
      onClick: (): void => setOperationType(RESET_DEVICE),
      loading: isStatsFetching,
      disable: isStatsFetching,
    },
    {
      align: 'right' as const,
      color: 'primary',
      label: t('label.suspend', 'Suspend'),
      tooltiplabel: t('label.active_sync_active_paused', 'The activesync is active / paused'),
      onClick: suspendNow,
      loading: isStatsFetching || isOperationPending,
      disable: isStatsFetching || isOperationPending,
    },
    {
      align: 'left' as const,
      icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
      onClick: (): void => setIsSticky(!isSticky),
    },
  ];

  return (
    <FormPageLayout
      title={device.accountName}
      unsavedChanges={isDirty}
      onCancel={() => form.reset()}
      onSave={(): void => {
        void form.handleSubmit();
      }}
    >
      <div className="w-full">
        <Displayer buttons={buttons} pinIcon={isSticky} />
      </div>
      <div className="flex w-full flex-col items-start p-lg">
        <ds-text as="h3" size="medium" weight="bold" color="gray0" className="w-full pt-lg">
          {t('label.status_lbl', 'Status')}
        </ds-text>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <Select<AbqDeviceStatus>
            items={abqStatusOptions}
            label={t('label.abq_status', 'ABQ Status')}
            selection={selectedAbqOption}
            onChange={(value: AbqDeviceStatus): void => {
              form.setFieldValue('abqStatus', value);
            }}
          />
        </div>
        <ds-text as="h3" size="medium" weight="bold" color="gray0" className="w-full pt-lg">
          {t('label.account', 'Account')}
        </ds-text>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <LabeledValue label={t('label.server', 'Server')} value={device.accountServer} />
          <LabeledValue label={t('label.e_mail', 'E-mail')} value={device.accountEmail} />
        </div>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <Select<0 | 1>
            items={statusOptions}
            label={t('label.status_lbl', 'Status')}
            selection={selectedStatusOption}
            onChange={(value: 0 | 1): void => {
              form.setFieldValue('statusValue', value);
            }}
          />
          <LabeledValue
            label={t('label.mobile_password', 'Mobile Password')}
            value={device.hasMobilePassword ? t('label.true', 'True') : t('label.false', 'False')}
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <LabeledValue label={t('label.device_id', 'Device ID')} value={device.deviceId} />
          <LabeledValue label={t('label.device', 'Device')} value={device.deviceType} />
        </div>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <LabeledValue label={t('label.user_agent', 'User Agent')} value={device.userAgent} />
          <LabeledValue label={t('label.eas', 'EAS')} value={''} />
        </div>
        <div className="grid w-full grid-cols-2 gap-x-xl pt-lg">
          <LabeledValue label={t('label.registration', 'Registration')} value={''} />
          <LabeledValue
            label={t('label.last_access', 'Last Access')}
            value={
              device.lastSeen ? format(new Date(device.lastSeen), 'yy/MM/dd | hh:mm:ss a') : ''
            }
          />
        </div>
        {operationType !== '' && (
          <ActiveDeviceConfirmation
            operationType={operationType}
            device={device}
            isPending={isOperationPending}
            onClose={closeConfirm}
            onConfirm={runConfirmedAction}
            onWipeAcknowledged={setWipeConfirmed}
          />
        )}
      </div>
    </FormPageLayout>
  );
};
