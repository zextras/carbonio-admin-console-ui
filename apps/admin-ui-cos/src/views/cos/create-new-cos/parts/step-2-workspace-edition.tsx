/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next';

import type { CreateCosFormApi, CreateCosFormValues } from '../types';
import { FeatureColumn } from './feature-column';
import { FeatureItem } from './feature-item';
import { FeatureRow } from './feature-row';
import { Step2Layout } from './step-2-layout';
import styles from './steps.module.css';

type StepTwoWorkspaceEditionProps = {
  form: CreateCosFormApi;
  onBack: () => void;
};

const WORKSPACE_FEATURE_KEYS: Array<keyof CreateCosFormValues> = [
  'carbonioFeatureMailsAppEnabled',
  'zimbraFeatureContactsEnabled',
  'zimbraFeatureCalendarEnabled',
  'carbonioFeatureFilesEnabled',
  'carbonioFeatureFilesAppEnabled',
  'carbonioFeatureTasksEnabled',
  'carbonioFeatureWscEnabled',
  'carbonioWscVideoCallEnabled',
];

export const StepTwoWorkspaceEdition = ({ form, onBack }: StepTwoWorkspaceEditionProps) => {
  const [t] = useTranslation();

  return (
    <Step2Layout form={form} onBack={onBack} featureKeys={WORKSPACE_FEATURE_KEYS}>
      <div className={styles.featureGroups}>
        <FeatureRow>
          <FeatureColumn title={t('label.mail', 'Mail')}>
            <FeatureItem
              form={form}
              name="carbonioFeatureMailsAppEnabled"
              label={t('cos.createCos.enable_mail', 'Enable mail')}
            />
          </FeatureColumn>
        </FeatureRow>

        <FeatureRow>
          <FeatureColumn title={t('label.contacts', 'Contacts')}>
            <FeatureItem
              form={form}
              name="zimbraFeatureContactsEnabled"
              label={t('cos.createCos.enable_contacts', 'Users can access Contacts')}
              description={t(
                'cos.createCos.contacts_description',
                'Personal and shared address books on the web client.',
              )}
            />
          </FeatureColumn>
          <FeatureColumn title={t('label.calendar', 'Calendar')}>
            <FeatureItem
              form={form}
              name="zimbraFeatureCalendarEnabled"
              label={t('cos.createCos.enable_calendar', 'Users can access Calendar')}
              description={t(
                'cos.createCos.calendar_description',
                'Calendars, appointments and scheduling on the web client.',
              )}
            />
          </FeatureColumn>
        </FeatureRow>

        <FeatureRow>
          <FeatureColumn title={t('label.files', 'Files')}>
            <FeatureItem
              form={form}
              name="carbonioFeatureFilesEnabled"
              label={t('cos.createCos.enable_files', 'Enable files')}
              description={t(
                'cos.createCos.files_description',
                'File storage and sharing on the web client.',
              )}
            />
            <FeatureItem
              form={form}
              name="carbonioFeatureFilesAppEnabled"
              label={t('cos.createCos.enable_mobile_app', 'Enable mobile app')}
            />
          </FeatureColumn>
          <FeatureColumn title={t('label.tasks', 'Tasks')}>
            <FeatureItem
              form={form}
              name="carbonioFeatureTasksEnabled"
              label={t('cos.createCos.enable_tasks', 'Enable tasks')}
            />
          </FeatureColumn>
        </FeatureRow>

        <FeatureRow divider={false}>
          <FeatureColumn title={t('label.chats', 'Chats')}>
            <FeatureItem
              form={form}
              name="carbonioFeatureWscEnabled"
              label={t('cos.createCos.enable_chats', 'Enable chats')}
              description={t(
                'cos.createCos.chats_description',
                'Messaging, group chats and file sharing between users.',
              )}
            />
          </FeatureColumn>
          <FeatureColumn title={t('label.video_calls', 'Video calls')}>
            <FeatureItem
              form={form}
              name="carbonioWscVideoCallEnabled"
              label={t('cos.createCos.enable_video_calls', 'Enable video calls')}
              description={t(
                'cos.createCos.video_calls_description',
                'One-to-one and group video calls within Chats.',
              )}
            />
          </FeatureColumn>
        </FeatureRow>
      </div>
    </Step2Layout>
  );
};
