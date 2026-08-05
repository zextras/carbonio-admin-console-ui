/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { getFieldErrorProps, Input } from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import { CREATE_COS_VALIDATION_MESSAGES } from '../schema';
import type { CreateCosFormApi } from '../types';

type CosNameFieldProps = {
  form: CreateCosFormApi;
};

export const CosNameField = ({ form }: CosNameFieldProps) => {
  const [t] = useTranslation();
  const isSubmitted = useSelector(form.store, (s) => s.submissionAttempts > 0);
  const field = useField({ form, name: 'cn' });

  const error = getFieldErrorProps(field, isSubmitted, t, CREATE_COS_VALIDATION_MESSAGES);

  return (
    <div className={styles.fieldStart}>
      <Input
        label={t('label.class_of_service_name', 'Class of service name')}
        isRequired
        backgroundColor="gray5"
        value={field.state.value}
        hasError={error.hasError}
        description={error.description}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          field.handleChange(e.target.value.toLowerCase());
        }}
      />
      <div className={styles.note}>
        <ds-text as="span" size="small" color="gray1">
          {t('cos.creatCOS.cosNameLowerCaseInfo', 'COS name must contain only lowercase letters.')}
        </ds-text>
      </div>
    </div>
  );
};
