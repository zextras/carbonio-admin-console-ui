/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, ListRow } from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { CosNameField } from '../fields/cos-name-field';
import { DescriptionField } from '../fields/description-field';
import { NotesField } from '../fields/notes-field';
import type { CreateCosFormApi } from '../types';
import styles from './steps.module.css';

type CreateNewCosStep1Props = {
  form: CreateCosFormApi;
  onNext: () => void;
};

export const CreateNewCosStep1 = ({ form, onNext }: CreateNewCosStep1Props) => {
  const [t] = useTranslation();

  const onCancel = (): void => {
    replaceHistory('/');
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerTitle}>
            <ds-text as="strong" size="medium" weight="bold" color="gray0">
              {t('label.new_cos', 'New COS')}
            </ds-text>
          </div>
          <ds-divider></ds-divider>
        </div>
      </div>
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
      <div className={styles.footer}>
        <Button
          label={t('label.cancel', 'Cancel')}
          icon="Close"
          color="secondary"
          onClick={onCancel}
        />
        <Button
          label={t('label.next', 'Next')}
          icon="ArrowForwardOutline"
          color="primary"
          disabled={!form.state.canSubmit}
          onClick={onNext}
        />
      </div>
    </div>
  );
};
