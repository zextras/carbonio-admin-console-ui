/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { ActiveEdition } from './parts/cards/active-edition';
import { MaxVersion } from './parts/cards/max-version';
import { SeatUtilization } from './parts/cards/seat-utilization';
import { SubscriptionStatus } from './parts/cards/subscription-status';
import styles from './perpetual-subscription.module.css';

export const PerpetualSubscription = () => {
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
        <MaxVersion />
      </div>
    </div>
  );
};
