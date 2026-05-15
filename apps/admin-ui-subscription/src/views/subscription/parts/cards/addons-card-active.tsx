/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { LicenseInfo } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { type AddonDisplayConfig } from '../sections/addons-section';
import styles from './addons-card.module.css';
import { SubscriptionQuotaProgressBar } from './subscription-quota-progress-bar';

type AddonsCardProps = {
  editions: LicenseInfo['editions'];
  accountCount: number;
  config: AddonDisplayConfig;
};

export const AddonsCardActive = ({ editions, accountCount, config }: AddonsCardProps) => {
  const { t } = useTranslation();

  if (!editions) return null;

  const edition = editions.find((e) => e.name === config.name)!;
  const total = Number.parseInt(edition.quantity, 10);
  const assigned = Math.min(accountCount, total);
  const available = Math.max(0, total - assigned);
  const fillPercent = (assigned / total) * 100;

  return (
    <div key={config.name} className={styles.addonRow}>
      <div className={styles.addonLeft}>
        <div className={styles.addonNameRow}>
          <ds-icon icon={config.icon} size="1.25rem" />
          <ds-text weight="bold" color="gray0">
            {t(config.labelKey, config.labelDefault)}
          </ds-text>
          <ds-badge color={theme.color.successBanner}>
            <ds-text size="small" color="gray0">
              {t('label.active', 'active').toUpperCase()}
            </ds-text>
          </ds-badge>
        </div>
        <ds-text size="small" overflow="break-word">
          {t(config.descriptionKey, config.descriptionDefault)}
        </ds-text>
      </div>
      <div className={styles.addonSeatUsage}>
        <div className={styles.quotaLabelRow}>
          <ds-text size="small">{t('core.subscription.seat_usage', 'Seat usage')}</ds-text>
          <ds-text size="small" color="gray0">
            {`${assigned}/${total}`}
          </ds-text>
        </div>
        <SubscriptionQuotaProgressBar fillPercent={fillPercent} />
      </div>
      <div className={styles.addonStats}>
        <div className={styles.statItem}>
          <ds-text size="extrasmall">{t('label.assigned', 'Assigned')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1rem' }}>
            {assigned}
          </ds-text>
        </div>
        <div className={styles.statItem}>
          <ds-text size="extrasmall">{t('label.available', 'Available')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1rem' }}>
            {available}
          </ds-text>
        </div>
        <div className={styles.statItem}>
          <ds-text size="extrasmall">{t('label.total_seat', 'Total seat')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1rem' }}>
            {total}
          </ds-text>
        </div>
      </div>
    </div>
  );
};
