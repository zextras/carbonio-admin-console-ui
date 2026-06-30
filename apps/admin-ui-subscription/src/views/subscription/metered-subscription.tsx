/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DataValidity } from './parts/cards/data-validity';
import { LastDataSent } from './parts/cards/last-data-sent';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { TotalAccounts } from './parts/cards/total-accounts';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { DetailsSection } from './parts/sections/details-section';
import { ActiveEditionSection } from './parts/sections/active-edition-section';
import { SubscriptionsHeader } from './parts/sections/subscriptions-header';
import styles from './subscription-layout.module.css';

export const MeteredSubscription = () => {
  return (
    <div className={styles.outer}>
      <SubscriptionsHeader />
      <div className={styles.row}>
        <SubscriptionStatus />
        <LastDataSent />
        <DataValidity />
        <TotalAccounts />
      </div>
      <div className={styles.content}>
        <ds-divider style={{ paddingBottom: '1.9rem', paddingTop: '0.4rem' }}></ds-divider>
        <ActiveEditionSection />
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
