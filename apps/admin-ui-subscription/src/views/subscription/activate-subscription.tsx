/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Input, Text } from '@zextras/ui-components';
import { useActivateLicense } from '@zextras/ui-shared';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import subscription_logo from '../../assets/subscription_empty.svg';
import styles from './activate-subscription.module.css';

type Module = {
  value: string;
  label: string;
};

export type AllModuleConfig = {
  name: Module;
  quantity: string;
  enabled: boolean;
};

export const ActivateSubscription = (): React.JSX.Element => {
  const [licenseKey, setLicenseKey] = useState('');
  const { t } = useTranslation();
  const activateLicenseMutation = useActivateLicense();

  const activateLicence = (): void => {
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <Text weight="bold" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </Text>
      </div>
      <divider-wc></divider-wc>
      <div className={styles.content}>
        <Text weight="bold">{t('core.subscription.activation_token', 'Activation token')}</Text>
        <div className={styles.inputRow}>
          <div className={styles.inputField}>
            <Input
              label={t('core.subscription.insert_token', 'Insert here the activation token')}
              backgroundColor="gray5"
              value={licenseKey}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setLicenseKey(e.target.value)}
            />
          </div>
          <div className={styles.buttonWrap}>
            <Button
              label={t('core.subscription.activate_subscription', 'Activate subscription')}
              onClick={(): void => activateLicence()}
            />
          </div>
        </div>
        <img src={subscription_logo} alt="logo" className={styles.logo} />
        <div className={styles.text}>
          <Text color="gray0">
            {t(
              'core.subscription.disclaimer',
              "Seems like you don't have a subscription token active yet.\nFill the field above or contact a vendor to get a new one.",
            )}
          </Text>
        </div>
      </div>
    </div>
  );
};
