/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MaxVersion } from './parts/cards/max-version';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import { ActivationTokenSection } from './parts/sections/activation-token-section';
import { ActiveEditionSection } from './parts/sections/active-edition-section';
import { AddonsSection } from './parts/sections/addons-section';
import { DetailsSection } from './parts/sections/details-section';
import { SubscriptionsHeader } from './parts/sections/subscriptions-header';
import styles from './subscription-layout.module.css';

export const PerpetualSubscription = () => {
  return (
    <div className={styles.outer}>
      <SubscriptionsHeader />
      <div className={styles.row}>
        <SubscriptionStatus />
        <MaxVersion />
      </div>
      <div className={styles.content}>
        <ActiveEditionSection />
        <AddonsSection />
        <ds-divider style={{ paddingBottom: '1.9rem', paddingTop: '0.4rem' }}></ds-divider>
        <DetailsSection />
        <ActivationTokenSection />
      </div>
    </div>
  );
};
