/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Input, Row, Text } from '@zextras/ui-components';
import {
  useActivateLicense,
  useCurrentUserRights,
  useLicenseInfo,
  useRemoveLicense,
} from '@zextras/ui-shared';
import { find } from 'lodash-es';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import logo from '../../assets/subscription_empty.svg';
import styles from './activate-subscription.module.css';
import { CONFIG } from '../../constants';
import { LicenseBanner } from '../dashboard/license-banner';

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

  const removeLicenseMutation = useRemoveLicense();
  const allowSetSubsciption = useMemo(() => {
    const rightsConfig = find(rights, { type: CONFIG }) || { all: [], type: CONFIG };
    return !!rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
  }, [rights]);

  const services = useMemo(() => {
    if (!licenseData) return null;
    return licenseData;
  }, [licenseData]);

  useEffect(() => {
    if (licenseData?.response?.authenticationToken) {
      setLicenseKey(licenseData.response.authenticationToken);
    }
  }, [licenseData?.response?.authenticationToken]);

  const activeLicence = (): void => {
    activateLicenseMutation.mutate({ token: licenseKey, renewal: false });
  };

  return (
    <div className={`${styles.container} ${styles.outer}`}>
      <LicenseBanner />
      <div className={`${styles.container} ${styles.header}`}>
        <Row
          orientation="horizontal"
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="100%"
          padding={{ all: 'large' }}
        >
          <Row mainAlignment="flex-start" crossAlignment="flex-start">
            <Text size="medium" weight="bold" color="gray0">
              {t('label.details', 'Details')}
            </Text>
          </Row>
        </Row>
      </div>

      <Row orientation="horizontal" width="100%" background="gray6">
        <divider-wc></divider-wc>
      </Row>
      <div className={`${styles.container} ${styles.content}`}>
        <Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'large' }}>
          <Text weight="bold">{t('core.subscription.activation', 'Activation')}</Text>
        </Row>
        <div className={`${styles.container} ${styles.inputRow}`}>
          <div className={`${styles.container} ${styles.inputWrapper}`}>
            <Input
              label={t('core.subscription.token', 'Token')}
              backgroundColor="gray5"
              value={licenseKey}
              disabled={!allowSetSubsciption}
              onChange={(e: any): void => setLicenseKey(e.target.value)}
            />
          </div>
          <div className={`${styles.container} ${styles.buttonWrapper}`}>
            <Button
              label={t('core.subscription.activate', 'Activate')}
              disabled={
                !allowSetSubsciption ||
                !licenseKey ||
                activateLicenseMutation.isPending ||
                removeLicenseMutation.isPending
              }
              type="outlined"
              color={!services?.response || services.response.expired ? 'primary' : 'error'}
              onClick={(): void => activeLicence()}
              loading={
                activateLicenseMutation.isPending && !activateLicenseMutation.variables?.renewal
              }
              size="extralarge"
            />
          </div>
        </div>
        <img src={logo} alt="logo" className={styles.logo} />
      </div>
    </div>
  );
};
