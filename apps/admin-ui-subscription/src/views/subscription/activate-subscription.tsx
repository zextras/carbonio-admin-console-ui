/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Input, Text } from '@zextras/ui-components';
import { useActivateLicense, useCurrentUserRights, useLicenseInfo } from '@zextras/ui-shared';
import { find } from 'lodash-es';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import subscription_logo from '../../assets/subscription_empty.svg';
import { CONFIG } from '../../constants';
import { LicenseBanner } from '../dashboard/license-banner';
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
  const { data: licenseData } = useLicenseInfo();
  const [licenseKey, setLicenseKey] = useState('');
  const { data: rights } = useCurrentUserRights();
  const { t } = useTranslation();

  const activateLicenseMutation = useActivateLicense();

  const allowSetSubsciption = useMemo(() => {
    const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
    return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  useEffect(() => {
    if (licenseData?.response?.authenticationToken) {
      setLicenseKey(licenseData.response.authenticationToken);
    }
  }, [licenseData?.response?.authenticationToken]);

  const activeLicence = (): void => {
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  return (
    <div className={styles.outer}>
      <LicenseBanner />
      <div className={styles.header}>
        <Text size="medium" weight="bold" color="gray0">
          {t('label.details', 'Details')}
        </Text>
      </div>
      <divider-wc></divider-wc>
      <div className={styles.content}>
        <Text weight="bold">{t('core.subscription.activation', 'Activation')}</Text>
        <div className={styles.inputRow}>
          <div className={styles.inputField}>
            <Input
              label={t('core.subscription.token', 'Token')}
              backgroundColor="gray5"
              value={licenseKey}
              disabled={!allowSetSubsciption}
              onChange={(e: any): void => setLicenseKey(e.target.value)}
            />
          </div>
          <div className={styles.buttonWrap}>
            <Button
              label={t('core.subscription.activate', 'Activate')}
              type="outlined"
              color={'primary'}
              onClick={(): void => activeLicence()}
              loading={
                activateLicenseMutation.isPending && !activateLicenseMutation.variables?.renewal
              }
              size="extralarge"
            />
          </div>
        </div>
        <img src={subscription_logo} alt="logo" className={styles.logo} />
      </div>
    </div>
  );
};
