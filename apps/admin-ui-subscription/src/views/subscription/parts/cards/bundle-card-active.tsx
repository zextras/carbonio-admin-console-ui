/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import { type BundleDisplayConfig } from '../sections/bundles-section';
import styles from './edition-card.module.css';

type BundleCardProps = {
  config: BundleDisplayConfig;
};

export const BundleCardActive = ({ config }: BundleCardProps) => {
  const { t } = useTranslation();

  return (
    <div key={config.name} className={styles.editionCard}>
      <div className={styles.editionCardHeader}>
        <ds-icon icon={config.icon} size="1.25rem" />
        <span style={{ width: '0.25rem' }} />
        <ds-text weight="bold" size="medium" color="gray0">
          {t(config.labelKey, config.labelDefault)}
        </ds-text>
      </div>
      <ds-text size="small" overflow="break-word">
        {t(config.descriptionKey, config.descriptionDefault)}
      </ds-text>
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <ds-text size="small">{t('label.total_seat', 'Total seat')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1.125rem' }}>
            {t('label.unlimited', 'Unlimited')}
          </ds-text>
        </div>
      </div>
    </div>
  );
};
