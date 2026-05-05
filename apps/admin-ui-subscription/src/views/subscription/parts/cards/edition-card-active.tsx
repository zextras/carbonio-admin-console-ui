/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type EditionDisplayConfig } from '../sections/active-edition-section';
import styles from './edition-card.module.css';
import { QuotaProgressBar } from './quota-progress-bar';

type EditionCardProps = {
  editions: Array<{ name: string; quantity: string }>;
  accountCount: number;
  config: EditionDisplayConfig;
};

export const EditionCardActive = ({ editions, accountCount, config }: EditionCardProps) => {
  const edition = editions.find((e) => e.name === config.name)!;
  const total = parseInt(edition.quantity, 10);
  const { t } = useTranslation();
  const assigned = Math.min(accountCount, total);
  const available = Math.max(0, total - assigned);
  const activeLabel = t('label.active', 'Active').toUpperCase();
  const fillPercent = total > 0 ? (assigned / total) * 100 : 0;
  const seatUsageLabel = t('core.subscription.seat_usage', 'Seat usage');
  const editionLabel = t(config.labelKey, config.labelDefault);

  return (
    <div key={config.name} className={styles.editionCard}>
      <div className={styles.editionCardHeader}>
        <ds-icon icon={config.icon} size="1.5rem" />
        <ds-text weight="bold" size="medium">
          {editionLabel}
        </ds-text>
        <span style={{ width: '0.5rem' }} />
        <ds-badge color={theme.color.successBanner}>
          <ds-text size="small">{activeLabel}</ds-text>
        </ds-badge>
      </div>
      <div>
        <div className={styles.quotaLabelRow}>
          <ds-text size="small">{seatUsageLabel}</ds-text>
          <ds-text size="small" color="gray0">
            {`${assigned}/${total}`}
          </ds-text>
        </div>
        <QuotaProgressBar fillPercent={fillPercent} />
      </div>
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <ds-text size="small">{t('label.assigned', 'Assigned')}</ds-text>
          <ds-text weight="bold" color="gray0" size="large">
            {assigned}
          </ds-text>
        </div>
        <div className={styles.statItem}>
          <ds-text size="small">{t('label.available', 'Available')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1.25rem' }}>
            {available}
          </ds-text>
        </div>
        <div className={styles.statItem}>
          <ds-text size="small">{t('label.total_seat', 'Total seat')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1.25rem' }}>
            {total}
          </ds-text>
        </div>
      </div>
    </div>
  );
};
