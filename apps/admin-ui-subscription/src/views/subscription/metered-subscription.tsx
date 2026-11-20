/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DataValidity } from './parts/cards/data-validity';
import { LastDataSent } from './parts/cards/last-data-sent';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { AddonsSection } from './parts/sections/addons-section';
import { BundlesSection } from './parts/sections/bundles-section';
import { DetailsSection } from './parts/sections/details-section';
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
      </div>
      <div className={styles.content}>
        <BundlesSection />
        <AddonsSection />
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
