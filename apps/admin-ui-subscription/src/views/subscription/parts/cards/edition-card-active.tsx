/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type EditionDisplayConfig } from '../sections/active-edition-section';
import styles from './edition-card.module.css';

type EditionCardProps = {
  editions: Array<{ name: string; quantity: string }>;
  config: EditionDisplayConfig;
};

export const EditionCardActive = ({ editions, config }: EditionCardProps) => {
  const edition = editions.find((e) => e.name === config.name)!;
  const total = parseInt(edition.quantity, 10);
  const { t } = useTranslation();
  const activeLabel = t('label.active', 'Active').toUpperCase();
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
      <div className={styles.statsRow}>
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
