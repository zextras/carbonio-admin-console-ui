/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLicenseInfo } from '@zextras/ui-shared';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './card.module.css';

type EditionConfig = {
  name: string;
  labelKey: string;
  labelDefault: string;
};

const EDITION_CONFIGS: Array<EditionConfig> = [
  { name: 'mail', labelKey: 'label.email', labelDefault: 'email' },
  { name: 'workspace', labelKey: 'label.workspace', labelDefault: 'workspace' },
];

function getActiveEditions(
  t: TFunction,
  editions?: Array<{ name: string; quantity: string }>,
): Array<string> {
  if (!editions) return [];
  return EDITION_CONFIGS.reduce<Array<string>>((acc, config) => {
    const edition = editions.find(
      (e) => e.name === config.name && e.quantity !== 'none' && e.quantity !== '0',
    );
    return edition ? [...acc, t(config.labelKey, config.labelDefault)] : acc;
  }, []);
}

export const ActiveEdition = () => {
  const { t } = useTranslation();
  const { data: licenseData } = useLicenseInfo();

  const activeEditions = getActiveEditions(t, licenseData?.response?.editions);

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.active_edition', 'Active edition')}
      </ds-text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {activeEditions.map((edition) => (
          <div key={edition} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ds-icon icon="CheckmarkCircle" color="success" size="1.5rem" />
            <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
              {edition.toUpperCase()}
            </ds-text>
          </div>
        ))}
      </div>
    </div>
  );
};
