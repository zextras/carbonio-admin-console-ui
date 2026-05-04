/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';

function getActiveEdition(
  t: TFunction,
  editions?: Array<{ name: string; quantity: string }>,
): string | null {
  if (!editions) return null;
  const mailEdition = editions.find(
    (e) => e.name === 'mail' && e.quantity !== 'none' && e.quantity !== '0',
  );
  return mailEdition ? t('label.email', 'EMAIL') : null;
}

export const ActiveEdition = () => {
  const { t } = useTranslation();
  const { data: licenseData } = useLicenseInfo();

  const edition = getActiveEdition(t, licenseData?.response?.editions)?.toUpperCase();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.active_edition', 'Active edition')}
      </ds-text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ds-icon icon="CheckmarkCircle" color="success" size="1.5rem" />
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {edition}
        </ds-text>
      </div>
    </div>
  );
};
