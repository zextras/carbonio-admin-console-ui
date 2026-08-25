/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Checkbox, Container, Modal, Padding } from '@zextras/ui-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RESET_DEVICE, WIPE_DEVICE } from '../../../../constants';
import type { MobileDeviceDetail } from '../../../../services/parse-active-sync';

type ActiveDeviceConfirmationProps = {
  operationType: string;
  device: MobileDeviceDetail;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onWipeAcknowledged: (confirmed: boolean) => void;
};

export const ActiveDeviceConfirmation = ({
  operationType,
  device,
  isPending,
  onClose,
  onConfirm,
  onWipeAcknowledged,
}: Readonly<ActiveDeviceConfirmationProps>) => {
  const [t] = useTranslation();
  const [awareResetSetting, setAwareResetSetting] = useState(false);
  const isWipe = operationType === WIPE_DEVICE;
  const isReset = operationType === RESET_DEVICE;

  const title = isWipe
    ? t('label.you_are_trying_wipe_device', 'You are trying to wipe a device')
    : t('label.you_are_trying_reset_device', 'You are trying to reset a device');
  const yesLabel = isWipe
    ? t('label.yes_wipe_the_device', 'Yes, wipe the device')
    : t('label.yes_reset_the_device', 'Yes, reset the device');
  const noLabel = isWipe
    ? t('label.no_donot_wipe_device', 'No, don`t wipe')
    : t('label.no_donot_reset_device', 'No, don`t reset');

  return (
    <Modal
      title={title}
      open
      showCloseIcon
      onClose={onClose}
      size="medium"
      customFooter={
        <Container orientation="horizontal" mainAlignment="flex-end">
          <Padding all="small">
            <Button
              label={yesLabel}
              color="error"
              loading={isPending}
              disabled={isPending}
              type="outlined"
              onClick={onConfirm}
            />
          </Padding>
          <Button label={noLabel} color="primary" onClick={onClose} />
        </Container>
      }
    >
      <Padding all="medium">
        <ds-text as="p" overflow="break-word" weight="regular">
          {isWipe &&
            t(
              'label.wiping_device_warning_msg_1',
              'Wiping a device will restore it to the factory settings. Are you sure you want to continue?',
            )}
          {isReset &&
            t(
              'label.rest_device_warning_msg_1',
              'Wiping a device will restore it to the factory settings. Are you sure you want to continue? ',
            )}
        </ds-text>
      </Padding>
      <Padding all="medium">
        <ds-text as="p" overflow="break-word" weight="regular">
          {t('label.account', 'Account')}: {device.accountEmail}
        </ds-text>
      </Padding>
      <Padding left="medium" bottom="medium">
        <ds-text as="p" overflow="break-word" weight="regular">
          {t('label.device_id', 'Device ID')}: {device.deviceId}
        </ds-text>
      </Padding>
      {isWipe && (
        <Padding top="medium" left="medium" bottom="large">
          <Checkbox
            iconColor="primary"
            size="small"
            label={t(
              'label.aware_of_doing_device_factory_settings',
              'I am aware of what I’m doing, I want to reset it to the factory settings ',
            )}
            value={awareResetSetting}
            onClick={(): void => {
              const next = !awareResetSetting;
              setAwareResetSetting(next);
              onWipeAcknowledged(next);
            }}
          />
        </Padding>
      )}
    </Modal>
  );
};

export default ActiveDeviceConfirmation;
