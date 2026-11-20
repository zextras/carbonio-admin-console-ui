/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { theme } from '@zextras/ui-components';
import {
	type LicenseV1AssignedSeatItem,
	type LicenseV1SeatItem,
} from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { type AddonDisplayConfig } from '../sections/addons-section';
import styles from './addons-card.module.css';

type AddonsCardProps = {
  addOns?: Array<LicenseV1SeatItem | LicenseV1AssignedSeatItem>;
  config: AddonDisplayConfig;
};

export const AddonsCardActive = ({ addOns, config }: AddonsCardProps) => {
  const { t } = useTranslation();

  if (!addOns) return null;

  const addOn = addOns.find((item) => item.name === config.name)!;
  const isSeatCapped = 'totalSeats' in addOn;

  return (
    <div key={config.name} className={styles.addonRowActive}>
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
      <div className={styles.addonStats}>
        <div className={styles.statItem}>
          <ds-text size="extrasmall">{t('label.total_seat', 'Total seat')}</ds-text>
          <ds-text weight="bold" color="gray0" style={{ fontSize: '1rem' }}>
            {isSeatCapped ? addOn.totalSeats : t('label.unlimited', 'Unlimited')}
          </ds-text>
        </div>
      </div>
    </div>
  );
};
