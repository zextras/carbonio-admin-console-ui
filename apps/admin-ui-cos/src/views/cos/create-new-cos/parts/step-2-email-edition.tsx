/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitch } from '../fields/feature-switch';
import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type StepTwoEmailEditionProps = {
  form: CreateCosFormApi;
  onBack: () => void;
};

const EMAIL_FEATURE_KEYS: Array<keyof CreateCosFormValues> = [
  'carbonioFeatureMailsAppEnabled',
  'zimbraFeatureContactsEnabled',
  'zimbraFeatureCalendarEnabled',
  'carbonioFeatureTasksEnabled',
];

export const StepTwoEmailEdition = ({ form, onBack }: StepTwoEmailEditionProps) => {
  const [t] = useTranslation();

  const disableAll = (): void => {
    for (const key of EMAIL_FEATURE_KEYS) {
      form.setFieldValue(key, 'FALSE' as never);
    }
  };

  return (
    <div className={styles.root}>
      <StepHeader />
      <div className={styles.scrollArea}>
        <div className={styles.formRow}>
          <div className={styles.formPanel}>
            <div className={styles.sectionTitle}>
              <ds-text as="strong" size="small" weight="bold" color="gray0">
                {t('label.create_new_cos', 'Create of New COS')}
              </ds-text>
            </div>
            <ds-divider></ds-divider>

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
              <Button
                label={t('label.disable_all', 'DISABLE ALL')}
                type="outlined"
                color="primary"
                size="small"
                onClick={disableAll}
              />
            </div>

            <div className={styles.featureGroups}>
              <div className={styles.featureRow}>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.mail', 'Mail')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioFeatureMailsAppEnabled"
                      label={t('cos.createCos.enable_mail', 'Enable mail')}
                    />
                  </ListRow>
                </div>
              </div>
              <ds-divider></ds-divider>

              <div className={styles.featureRow}>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.contacts', 'Contacts')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="zimbraFeatureContactsEnabled"
                      label={t(
                        'cos.createCos.enable_contacts',
                        'Users can access Contacts',
                      )}
                    />
                  </ListRow>
                  <ds-text as="span" size="small" color="gray1" weight="light">
                    {t(
                      'cos.createCos.contacts_description',
                      'Personal and shared address books on the web client.',
                    )}
                  </ds-text>
                </div>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.calendar', 'Calendar')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="zimbraFeatureCalendarEnabled"
                      label={t(
                        'cos.createCos.enable_calendar',
                        'Users can access Calendar',
                      )}
                    />
                  </ListRow>
                  <ds-text as="span" size="small" color="gray1" weight="light">
                    {t(
                      'cos.createCos.calendar_description',
                      'Calendars, appointments and scheduling on the web client.',
                    )}
                  </ds-text>
                </div>
              </div>
              <ds-divider></ds-divider>

              <div className={styles.featureRow}>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.tasks', 'Tasks')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioFeatureTasksEnabled"
                      label={t('cos.createCos.enable_tasks', 'Enable tasks')}
                    />
                  </ListRow>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StepFooter form={form} onBack={onBack} onPrimary={() => form.handleSubmit()} />
    </div>
  );
};
