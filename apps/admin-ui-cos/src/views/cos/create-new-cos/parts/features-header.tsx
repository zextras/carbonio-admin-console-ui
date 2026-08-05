/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import styles from './steps.module.css';

type FeaturesHeaderProps = {
  form: CreateCosFormApi;
  featureKeys: Array<keyof CreateCosFormValues>;
};

export const FeaturesHeader = ({ form, featureKeys }: FeaturesHeaderProps) => {
  const [t] = useTranslation();
  const disableAll = (): void => {
    for (const key of featureKeys) {
      form.setFieldValue(key, 'FALSE' as never);
    }
  };
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
      <div className={styles.featuresIntro}>
        <ds-text as="strong" size="small" weight="bold" color="gray0">
          {title}
        </ds-text>
        <ds-text as="span" size="small" color="gray0" overflow="break-word">
          {description}
        </ds-text>
      </div>
      <div className={styles.disableAllWrapper}>
        <Button
          label={t('label.disable_all', 'DISABLE ALL')}
          type="outlined"
          color="primary"
          onClick={disableAll}
        />
      </div>
    </div>
  );
};
