/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';

export const MaxVersion = () => {
  const { t } = useTranslation();

  const title = t('core.subscription.maxCarbonioVersion', 'Max Carbonio Version');

  const { data: licenseData } = useLicenseInfo();

  const maxVersionAvailable = licenseData?.response?.maxCarbonioVersion;

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {title}
      </ds-text>
      <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
        {maxVersionAvailable}
      </ds-text>
    </div>
  );
};
