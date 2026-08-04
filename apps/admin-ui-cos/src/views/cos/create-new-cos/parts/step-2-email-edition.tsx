/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CreateCosFormApi } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type StepTwoEmailEditionProps = {
  form: CreateCosFormApi;
  onBack: () => void;
};

export const StepTwoEmailEdition = ({ form, onBack }: StepTwoEmailEditionProps) => {
  const [t] = useTranslation();

  return (
    <div className={styles.root}>
      <StepHeader />
      <div className={styles.scrollArea}>
        <div className={styles.formRow}>
          <div className={styles.formPanel}>
            <div className={styles.sectionTitle}>
              <ds-text as="strong" size="small" weight="bold" color="gray0">
                {t('label.create_new_cos', 'Create New COS')}
              </ds-text>
            </div>
            <ListRow>
              <div className={styles.fieldStart}>
                <Switch
                  label={t('create_new_cos.enable_tasks', 'Enable Tasks')}
                  onClick={(): void => {}}
                  iconColor="primary"
                />
              </div>
            </ListRow>
          </div>
        </div>
      </div>
      <StepFooter form={form} onBack={onBack} onPrimary={() => form.handleSubmit()} />
    </div>
  );
};
