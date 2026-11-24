/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type BundleDisplayConfig } from '../sections/bundles-section';
import styles from './edition-card.module.css';

type BundleCardProps = {
  config: BundleDisplayConfig;
};

export const BundleCardInactive = ({ config }: BundleCardProps) => {
  const { t } = useTranslation();
  const inactiveLabel = t('label.inactive', 'not active').toUpperCase();

  return (
    <div key={config.name} className={`${styles.editionCard} ${styles.editionCardInactive}`}>
      <div className={styles.editionCardHeader}>
        <ds-icon icon={config.icon} size="1.25rem" />
        <span style={{ width: '0.25rem' }} />
        <ds-text weight="bold" size="medium">
          {t(config.labelKey, config.labelDefault)}
        </ds-text>
        <span style={{ width: '0.5rem' }} />
        <ds-badge color={theme.color.gray0.disabled}>
          <ds-text size="small">{inactiveLabel}</ds-text>
        </ds-badge>
      </div>
      <ds-text size="small" overflow="break-word">
        {t(config.descriptionKey, config.descriptionDefault)}
      </ds-text>
    </div>
  );
};
