/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import styles from './steps.module.css';

export const FeaturesHeader = () => {
  const [t] = useTranslation();
  const title = t(
    'cos.createCos.choose_features',
    'Choose which features to enable for this edition',
  );
  const description = t(
    'cos.createCos.features_description',
    'All features are enabled by default. Pick what this Class of Service should include. You can always adjust individual features later.',
  );

  return (
    <div className={styles.featuresHeader}>
      <ds-text as="strong" size="small" weight="bold" color="gray0">
        {title}
      </ds-text>
      <ds-text as="span" size="small" color="gray0" overflow="break-word">
        {description}
      </ds-text>
    </div>
  );
};
