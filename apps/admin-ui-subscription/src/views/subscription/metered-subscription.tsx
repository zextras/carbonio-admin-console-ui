/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { DataValidity } from './parts/cards/data-validity';
import { LastDataSent } from './parts/cards/last-data-sent';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { TotalAccounts } from './parts/cards/total-accounts';
import { DetailsSection } from './parts/sections/details-section';
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
        <LastDataSent />
        <DataValidity />
        <TotalAccounts />
      </div>
      <div className={styles.content}>
        <ds-divider style={{paddingBottom:'1.9rem', paddingTop:'0.4rem'}}></ds-divider>
        <DetailsSection />
      </div>
    </div>
  );
};
