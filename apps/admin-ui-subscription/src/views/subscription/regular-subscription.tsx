/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { ActiveEdition } from './parts/cards/active-edition';
import { SeatUtilization } from './parts/cards/seat-utilization';
import { SubscriptionExpiry } from './parts/cards/subscription-expiry';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { DetailsSection } from './parts/sections/details-section';
import styles from './subscription-layout.module.css';

export const RegularSubscription = () => {
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
        <ActiveEdition />
        <SeatUtilization />
        <SubscriptionExpiry />
      </div>
      <div className={styles.content}>
        <ds-divider style={{paddingBottom:'1.9rem', paddingTop:'0.4rem'}}></ds-divider>
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
