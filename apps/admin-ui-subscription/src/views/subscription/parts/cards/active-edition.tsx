/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './card.module.css';

export const ActiveEdition = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.card}>
      <ds-text size="small" as="span" color="gray0">
        {t('core.subscription.active_edition', 'Active edition')}
      </ds-text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ds-icon icon="CheckmarkCircle" color="success" size="1.5rem" />
        <ds-text weight="bold" color="gray0" style={{ fontSize: '1.5rem' }}>
          {/* TODO: CO-3521 fix this */}
          {'EMAIL'}
        </ds-text>
      </div>
    </div>
  );
};
