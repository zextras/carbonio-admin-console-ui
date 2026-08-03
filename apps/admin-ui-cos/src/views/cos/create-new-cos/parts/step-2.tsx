/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import {
  Button,
  CustomTextArea,
  getFieldErrorProps,
  Input,
  ListRow,
} from '@zextras/ui-components';
import { replaceHistory } from '@zextras/ui-shared';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CREATE_COS_VALIDATION_MESSAGES } from '../schema';
import type { CreateCosFormApi } from '../types';
import styles from './steps.module.css';

type CreateNewCosStep2Props = {
  form: CreateCosFormApi;
  onBack: () => void;
};

export const CreateNewCosStep2 = ({ form, onBack }: CreateNewCosStep2Props) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);

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
              <div className={styles.fieldStart}>
                <form.Field name="cn">
                  {(field) => {
                    const error = getFieldErrorProps(
                      field,
                      isSubmitted,
                      t,
                      CREATE_COS_VALIDATION_MESSAGES,
                    );
                    return (
                      <Input
                        label={t('label.cos_name', 'Cos Name')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        hasError={error.hasError}
                        description={error.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                          field.handleChange(e.target.value.toLowerCase());
                        }}
                      />
                    );
                  }}
                </form.Field>
                <div className={styles.note}>
                  <ds-text as="span" size="small" color="gray1">
                    {t(
                      'cos.creatCOS.cosNameLowerCaseInfo',
                      'COS name must contain only lowercase letters.',
                    )}
                  </ds-text>
                </div>
              </div>
            </ListRow>
            <ListRow>
              <div className={styles.fieldCenter}>
                <form.Field name="description">
                  {(field) => {
                    const error = getFieldErrorProps(
                      field,
                      isSubmitted,
                      t,
                      CREATE_COS_VALIDATION_MESSAGES,
                    );
                    return (
                      <Input
                        label={t('label.description', 'Description')}
                        backgroundColor="gray5"
                        value={field.state.value}
                        hasError={error.hasError}
                        description={error.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                          field.handleChange(e.target.value);
                        }}
                      />
                    );
                  }}
                </form.Field>
              </div>
            </ListRow>
            <ListRow>
              <div className={styles.fieldCenter}>
                <form.Field name="zimbraNotes">
                  {(field) => (
                    <CustomTextArea
                      label={t('label.notes', 'Notes')}
                      backgroundColor="gray5"
                      value={field.state.value}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => {
                        field.handleChange(e.target.value);
                      }}
                    />
                  )}
                </form.Field>
              </div>
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
        <div className={styles.footerActions}>
          <Button
            label={t('label.back', 'BACK')}
            color="secondary"
            onClick={onBack}
          />
          <Button
            label={t('label.create', 'create')}
            icon="CheckmarkCircle"
            color="primary"
            disabled={!form.state.canSubmit}
            onClick={() => form.handleSubmit()}
          />
        </div>
      </div>
    </div>
  );
};
