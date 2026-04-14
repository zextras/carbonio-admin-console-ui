/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Input, Text } from '@zextras/ui-components';
import { useActivateLicense } from '@zextras/ui-shared';
import React, { ChangeEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import subscription_logo from '../../assets/subscription_empty.svg';
import { MANAGE_APP_ID, SUBSCRIPTIONS_ROUTE_ID } from '../../constants';
import styles from './activate-subscription.module.css';
import { ActivationError } from './parts/activation-error';
import { ActivationProgress } from './parts/activation-progress';
import { ActivationSuccess } from './parts/activation-success';

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
  const [showResult, setShowResult] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activateLicenseMutation = useActivateLicense();

  const activateLicence = (): void => {
    setShowResult(false);
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  const handleProgressComplete = useCallback((): void => {
    setShowResult(true);
  }, []);

  const handleSuccessComplete = useCallback((): void => {
    navigate(`/${MANAGE_APP_ID}/${SUBSCRIPTIONS_ROUTE_ID}`, { replace: true });
  }, [navigate]);

  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <Text weight="bold" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </Text>
      </div>
      <divider-wc></divider-wc>
      <div className={styles.content}>
        <Text weight="bold">{t('subscription.activate.activation_token', 'Activation token')}</Text>
        <div className={styles.inputRow}>
          <div className={styles.inputField}>
            <Input
              label={t('subscription.activate.insert_token', 'Insert here the activation token')}
              autoFocus
              trimOnPaste
              backgroundColor="gray5"
              value={licenseKey}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setLicenseKey(e.target.value)}
            />
          </div>
          <div className={styles.buttonWrap}>
            <Button
              label={t('subscription.activate.activate', 'Activate subscription')}
              onClick={(): void => activateLicence()}
            />
          </div>
        </div>
        <img src={subscription_logo} alt="subscription logo" className={styles.logo} />
        <div className={styles.text}>
          <Text color="gray0">
            {t(
              'subscription.activate.disclaimer',
              "Seems like you don't have a subscription token active yet.\nFill the field above or contact a vendor to get a new one.",
            )}
          </Text>
        </div>
      </div>
      <ActivationProgress
        isPending={activateLicenseMutation.isPending}
        onComplete={handleProgressComplete}
      />
      <ActivationSuccess
        isSuccess={showResult && activateLicenseMutation.isSuccess}
        onComplete={handleSuccessComplete}
      />
      <ActivationError isError={showResult && activateLicenseMutation.isError} />
    </div>
  );
};
