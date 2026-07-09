/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SubscriptionExpiry } from './parts/cards/subscription-expiry';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { ActiveEditionSection } from './parts/sections/active-edition-section';
import { AddonsSection } from './parts/sections/addons-section';
import { DetailsSection } from './parts/sections/details-section';
import { SubscriptionsHeader } from './parts/sections/subscriptions-header';
import styles from './subscription-layout.module.css';

export const RegularSubscription = () => {
  return (
    <div className={styles.outer}>
      <SubscriptionsHeader />
      <div className={styles.row}>
        <SubscriptionStatus />
        <SubscriptionExpiry />
      </div>
      <div className={styles.content}>
        <ActiveEditionSection />
        <AddonsSection />
        <ds-divider style={{ padding: '1.5rem 0' }}></ds-divider>
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
