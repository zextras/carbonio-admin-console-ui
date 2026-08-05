/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CreateCosFormApi, CreateCosFormValues } from '../types';
import styles from './steps.module.css';

const FEATURE_KEYS: Array<keyof CreateCosFormValues> = [
  'carbonioFeatureMailsAppEnabled',
  'zimbraFeatureContactsEnabled',
  'zimbraFeatureCalendarEnabled',
  'carbonioFeatureFilesEnabled',
  'carbonioFeatureFilesAppEnabled',
  'carbonioFeatureTasksEnabled',
  'carbonioFeatureWscEnabled',
  'carbonioWscVideoCallEnabled',
];

export const FeaturesHeader = ({ form }: { form: CreateCosFormApi }) => {
  const [t] = useTranslation();
  const disableAll = (): void => {
    for (const key of FEATURE_KEYS) {
      form.setFieldValue(key, 'FALSE' as never);
    }
  };
  return (
    <div className={styles.featuresHeader}>
      <div className={styles.featuresIntro}>
        <ds-text as="strong" size="small" weight="bold" color="gray0">
          {t('cos.createCos.choose_features', 'Choose which feature enable')}
        </ds-text>
        <ds-text as="span" size="small" color="gray0">
          {t(
            'cos.createCos.features_description',
            'All features are enabled by default. Decide what this Class of Service includes now; every feature can be fine-tuned later in its dedicated settings.',
          )}
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
