/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@zextras/ui-components';
import { invalidateLicenseQuery, useActivateLicense, useBreakpoint } from '@zextras/ui-shared';
import React, { ChangeEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import subscription_logo from '../../assets/subscription_empty.svg';
import styles from './activate-subscription.module.css';
import { ActivationError } from './parts/activation/activation-error';
import { ActivationProgress } from './parts/activation/activation-progress';
import { ActivationSuccess } from './parts/activation/activation-success';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const activateLicenseMutation = useActivateLicense();
  const breakpoint = useBreakpoint();
  const isLargeViewport = breakpoint === 'xl' || breakpoint === '2xl';

  const activationTokenSchema = z
    .string()
    .trim()
    .min(1, t('subscription.activate.error.empty', 'Please enter your activation token'));

  const validate = useCallback(
    (value: string): boolean => {
      const result = activationTokenSchema.safeParse(value);
      if (!result.success) {
        setValidationError(result.error.issues[0]?.message);
        return false;
      }
      setValidationError(null);
      return true;
    },
    [activationTokenSchema],
  );

  const activateLicence = (): void => {
    if (!validate(licenseKey)) return;
    setShowResult(false);
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  const handleProgressComplete = useCallback((): void => {
    setShowResult(true);
  }, []);

  const handleSuccessComplete = useCallback((): void => {
    invalidateLicenseQuery(queryClient);
  }, [queryClient]);

  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </ds-text>
      </div>
      <ds-divider></ds-divider>
      <div className={styles.content}>
        <ds-text as="label" weight="bold">
          {t('subscription.activate.activation_token', 'Activation token')}
        </ds-text>
        <div className={styles.inputRow}>
          <div className={styles.inputField}>
            <Input
              label={t('subscription.activate.insert_token', 'Insert here the activation token')}
              autoFocus
              trimOnPaste
              backgroundColor="gray5"
              hasError={validationError !== null}
              value={licenseKey}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setLicenseKey(e.target.value);
                if (validationError !== null) setValidationError(null);
              }}
              onBlur={(): void => {
                if (licenseKey.length > 0) validate(licenseKey);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                if (e.key === 'Enter') activateLicence();
              }}
            />
            {validationError !== null && (
              <ds-text as="span" color="error" size="small" className={styles.errorMessage}>
                {validationError}
              </ds-text>
            )}
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
          <ds-text
            as="p"
            color="gray0"
            overflow="break-word"
            style={{ whiteSpace: isLargeViewport ? 'normal' : 'pre-line' }}
          >
            {t(
              'subscription.activate.disclaimer',
              "Seems like you don't have a subscription token active yet.\nFill the field above or contact a vendor to get a new one.",
            )}
          </ds-text>
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
