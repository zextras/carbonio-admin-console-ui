/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, PlainInput } from '@zextras/ui-components';
import { useActivateLicense, useBreakpoint } from '@zextras/ui-shared';
import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import subscription_logo from '../../assets/subscription_empty.svg';
import styles from './activate-subscription.module.css';
import { ActivationError } from './parts/activation/activation-error';
import { ActivationProgress } from './parts/activation/activation-progress';
import { ActivationSuccess } from './parts/activation/activation-success';
import { handleTrimmedPaste } from './trim-paste';

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
  const activateLicenseMutation = useActivateLicense();
  const breakpoint = useBreakpoint();
  const isLargeViewport = breakpoint === 'xl' || breakpoint === '2xl';

  const activationTokenSchema = z
    .string()
    .trim()
    .min(1, t('subscription.activate.error.empty', 'Please enter your activation token'));

  const validate = (value: string): boolean => {
    const result = activationTokenSchema.safeParse(value);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const activateLicence = (): void => {
    if (!validate(licenseKey)) return;
    setShowResult(false);
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  const handleProgressComplete = (): void => {
    setShowResult(true);
  };

  const handleSuccessComplete = (): void => {};

  const handleTokenChange = (value: string): void => {
    setLicenseKey(value);
    if (validationError !== null) setValidationError(null);
  };

  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </ds-text>
      </div>
      <div className={styles.content}>
        <div className={styles.inputRow}>
          <div className={styles.inputField}>
            <PlainInput
              label={t('subscription.activate.insert_token', 'Insert here the activation token')}
              hasError={validationError !== null}
              description={validationError}
              value={licenseKey}
              onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                handleTokenChange(e.target.value)
              }
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>): void =>
                handleTrimmedPaste(e, handleTokenChange)
              }
              onBlur={(): void => {
                if (licenseKey.length > 0) validate(licenseKey);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                if (e.key === 'Enter') activateLicence();
              }}
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
      {showResult && activateLicenseMutation.isError && <ActivationError />}
    </div>
  );
};
