/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CosNameField } from '../fields/cos-name-field';
import { DescriptionField } from '../fields/description-field';
import { NotesField } from '../fields/notes-field';
import type { CreateCosFormApi } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type CreateNewCosStep1Props = {
  form: CreateCosFormApi;
  onNext: () => void;
};

export const CreateNewCosStep1 = ({ form, onNext }: CreateNewCosStep1Props) => {
  const [t] = useTranslation();

  return (
    <div className={styles.root}>
      <StepHeader />
      <div className={styles.scrollArea}>
        <div className={styles.formRow}>
          <div className={styles.formPanel}>
            <div className={styles.sectionTitle}>
              <ds-text as="strong" size="small" weight="bold" color="gray0">
                {t('label.general_information', 'General Information')}
              </ds-text>
            </div>
            <ListRow>
              <CosNameField form={form} />
            </ListRow>
            <ListRow>
              <DescriptionField form={form} />
            </ListRow>
            <ListRow>
              <NotesField form={form} />
            </ListRow>
          </div>
        </div>
      </div>
      <StepFooter form={form} isFirstStep onPrimary={onNext} />
    </div>
  );
};
