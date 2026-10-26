/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { Radio, RadioGroup } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CreateCosFormApi } from '../types';

type EditionFieldProps = {
  form: CreateCosFormApi;
};

export const EditionField = ({ form }: EditionFieldProps) => {
  const [t] = useTranslation();
  const field = useField({ form, name: 'edition' });

  return (
    <RadioGroup
      aria-label={t('label.edition.title', 'Edition')}
      value={field.state.value}
      onChange={(value) => {
        if (value) {
          field.handleChange(value);
        }
      }}
    >
      <Radio
        value="mail"
        label={t('cos.createCos.edition.email_title', 'Email edition')}
        description={t(
          'cos.createCos.edition.email_description',
          'Includes email, mobile apps, push notifications, and real-time backup.',
        )}
      />
      <Radio
        value="workspace"
        label={t('cos.createCos.edition.workspace_title', 'Workspace edition')}
        description={t(
          'cos.createCos.edition.workspace_description',
          'Everything in Email, plus Files & Docs and Chat & Video.',
        )}
      />
    </RadioGroup>
  );
};
