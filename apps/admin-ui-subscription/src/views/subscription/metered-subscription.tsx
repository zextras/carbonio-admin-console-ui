/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { BillingPeriod } from './parts/cards/billing-period';
import { DataValidity } from './parts/cards/data-validity';
import { LastDataSent } from './parts/cards/last-data-sent';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import styles from './subscription-layout.module.css';

export const MeteredSubscription = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.outer}>
      <div className={styles.header}>
        <ds-text as="h2" weight="bold" size="extralarge" color="gray0">
          {t('label.subscriptions', 'Subscriptions')}
        </ds-text>
      </div>
      <div className={styles.row}>
        <SubscriptionStatus />
        <BillingPeriod />
        <LastDataSent />
        <DataValidity />
      </div>
    </div>
  );
};
