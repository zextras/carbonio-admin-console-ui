/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { useLicenseInfo } from '@zextras/ui-shared';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { DATE_FORMAT } from './constants';
import { SubscriptionExpiry } from './parts/cards/subscription-expiry';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { ActiveEditionSection } from './parts/sections/active-edition-section';
import { AddonsSection } from './parts/sections/addons-section';
import { DetailsSection } from './parts/sections/details-section';
import styles from './subscription-layout.module.css';

export const RegularSubscription = () => {
  const { t } = useTranslation();

  const { data: licenseData, isFetching, refetch } = useLicenseInfo();
  const updateTime = licenseData?.response?.updateTime;
  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" size="extralarge" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </ds-text>
        <div className={styles.syncRow}>
          {updateTime && (
            <ds-text size="small">
              {`${t('label.last_sync', 'Last sync')} ${format(updateTime, DATE_FORMAT)}`}
            </ds-text>
          )}
          <Button
            label={t('label.update_data', 'Update data')}
            type="outlined"
            icon="Sync"
            iconPlacement="right"
            onClick={(): void => {
              void refetch();
            }}
            loading={isFetching}
          />
        </div>
      </div>
      <div className={styles.row}>
        <SubscriptionStatus />
        <SubscriptionExpiry />
      </div>
      <div className={styles.content}>
        <ActiveEditionSection />
        <AddonsSection />
        <ds-divider></ds-divider>
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
