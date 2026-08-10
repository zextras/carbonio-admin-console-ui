/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Radio, RadioGroup } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from '../parts/steps.module.css';
import type { CreateCosFormApi } from '../types';

type EditionFieldProps = {
  form: CreateCosFormApi;
};

export const EditionField = ({ form }: EditionFieldProps) => {
  const [t] = useTranslation();
  const field = useField({ form, name: 'edition' });

  const emailTitle = t('cos.createCos.edition.email_title', 'Email edition');
  const workspaceTitle = t('cos.createCos.edition.workspace_title', 'Workspace edition');

  return (
    <RadioGroup
      value={field.state.value}
      onChange={(value) => {
        if (value) {
          field.handleChange(value);
        }
      }}
    >
      <Radio
        value="mail"
        iconColor="primary"
        aria-label={emailTitle}
        label={
          <div className={styles.editionOption}>
            <ds-text as="strong" size="small" weight="bold" color="gray0">
              {emailTitle}
            </ds-text>
            <ds-text as="span" size="small" color="gray1">
              {t(
                'cos.createCos.edition.email_description',
                'Includes email, mobile apps, push notifications, and real-time backup.',
              )}
            </ds-text>
          </div>
        }
      />
      <div style={{ paddingBottom: '0.5rem' }} />
      <Radio
        value="workspace"
        iconColor="primary"
        aria-label={workspaceTitle}
        label={
          <div className={styles.editionOption}>
            <ds-text as="strong" size="small" weight="bold" color="gray0">
              {workspaceTitle}
            </ds-text>
            <ds-text as="span" size="small" color="gray1">
              {t(
                'cos.createCos.edition.workspace_description',
                'Everything in Email, plus Files & Docs and Chat & Video.',
              )}
            </ds-text>
          </div>
        }
      />
    </RadioGroup>
  );
};
