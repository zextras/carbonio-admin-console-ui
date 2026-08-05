/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { FeatureSwitch } from '../fields/feature-switch';
import type { CreateCosFormApi } from '../types';
import { FeaturesHeader } from './features-header';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type StepTwoWorkspaceEditionProps = {
  form: CreateCosFormApi;
  onBack: () => void;
};

export const StepTwoWorkspaceEdition = ({ form, onBack }: StepTwoWorkspaceEditionProps) => {
  const [t] = useTranslation();

  return (
    <div className={styles.root}>
      <StepHeader />
      <div className={styles.scrollArea}>
        <div className={styles.formRow}>
          <div className={styles.formPanel}>
            <FeaturesHeader form={form} />
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
                      label={t('cos.createCos.enable_contacts', 'Users can access Contacts')}
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
                      label={t('cos.createCos.enable_calendar', 'Users can access Calendar')}
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
                    {t('label.files', 'Files')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioFeatureFilesEnabled"
                      label={t('cos.createCos.enable_files', 'Enable files')}
                    />
                  </ListRow>
                  <ds-text as="span" size="small" color="gray1" weight="light">
                    {t(
                      'cos.createCos.files_description',
                      'File storage and sharing on the web client.',
                    )}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioFeatureFilesAppEnabled"
                      label={t('cos.createCos.enable_mobile_app', 'Enable mobile app')}
                    />
                  </ListRow>
                </div>
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
              <ds-divider></ds-divider>

              <div className={styles.featureRow}>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.chats', 'Chats')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioFeatureWscEnabled"
                      label={t('cos.createCos.enable_chats', 'Enable chats')}
                    />
                  </ListRow>
                  <ds-text as="span" size="small" color="gray1" weight="light">
                    {t(
                      'cos.createCos.chats_description',
                      'Messaging, group chats and file sharing between users.',
                    )}
                  </ds-text>
                </div>
                <div className={styles.featureColumn}>
                  <ds-text as="strong" size="small" weight="bold" color="gray0">
                    {t('label.video_calls', 'Video calls')}
                  </ds-text>
                  <ListRow>
                    <FeatureSwitch
                      form={form}
                      name="carbonioWscVideoCallEnabled"
                      label={t('cos.createCos.enable_video_calls', 'Enable video calls')}
                    />
                  </ListRow>
                  <ds-text as="span" size="small" color="gray1" weight="light">
                    {t(
                      'cos.createCos.video_calls_description',
                      'One-to-one and group video calls within Chats.',
                    )}
                  </ds-text>
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
