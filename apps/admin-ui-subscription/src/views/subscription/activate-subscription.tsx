/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Input, Text } from '@zextras/ui-components';
import { useActivateLicense } from '@zextras/ui-shared';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
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
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();
  const activateLicenseMutation = useActivateLicense();
  const popoverRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (activateLicenseMutation.isPending) {
      setProgress(0);
      popoverRef.current?.showPopover();
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearProgressInterval();
            return prev;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 300);
    } else if (progress > 0) {
      clearProgressInterval();
      setProgress(100);
      const timeout = setTimeout(() => {
        popoverRef.current?.hidePopover();
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
    return clearProgressInterval;
  }, [activateLicenseMutation.isPending, clearProgressInterval, progress]);

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
              autoFocus
              trimOnPaste
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
      <div popover="manual" ref={popoverRef} className={styles.popover}>
        <Text weight="bold" size="large">
          {t('core.subscription.activating_subscription', 'Activating subscription')}
        </Text>
        <div className={styles.popoverDescription}>
          <Text color="gray0">
            {t(
              'core.subscription.activating_description',
              'Please wait while we verify and set up your workspace',
            )}
          </Text>
        </div>
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
