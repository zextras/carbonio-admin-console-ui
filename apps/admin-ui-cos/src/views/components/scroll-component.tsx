/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './scroll-component.module.css';

export const ScrollComponent = () => {
  const [t] = useTranslation();
  return (
    <div className={styles.scrollingContainer}>
      <div className={styles.innerRow}>
        <ds-icon icon="ArrowheadDown" size="large"></ds-icon>
        <div className={styles.textPadding}>
          <ds-text as="h2" size="large" weight="light" color="gray">
            {t('label.scroll_down_to_view_other_items', 'Scroll down to view other items')}
          </ds-text>
        </div>
      </div>
    </div>
  );
};
