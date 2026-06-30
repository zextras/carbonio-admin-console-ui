/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type AddonDisplayConfig } from '../sections/addons-section';
import styles from './addons-card.module.css';

type AddonsCardProps = {
  config: AddonDisplayConfig;
};

export const AddonsCardInactive = ({ config }: AddonsCardProps) => {
  const { t } = useTranslation();

  return (
    <div key={config.name} className={styles.addonRowInactive}>
      <div className={styles.addonLeft}>
        <div className={styles.addonNameRow}>
          <ds-icon icon={config.icon} size="1.25rem" />
          <ds-text weight="bold" color="gray0">
            {t(config.labelKey, config.labelDefault)}
          </ds-text>
          <ds-badge color={theme.color.gray4.regular}>
            <ds-text size="small" weight="bold">
              {t('label.not_active', 'not active').toUpperCase()}
            </ds-text>
          </ds-badge>
        </div>
        <ds-text size="small">{t(config.descriptionKey, config.descriptionDefault)}</ds-text>
      </div>
    </div>
  );
};
