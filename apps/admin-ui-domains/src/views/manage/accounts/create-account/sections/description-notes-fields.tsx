/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useField } from '@tanstack/react-form';
import { TextInput, PlainTextarea } from '@zextras/ui-components';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateAccountFormContext } from '../create-account-form-context';

export const DescriptionNotesFields = (): ReactElement => {
  const [t] = useTranslation();
  const { form } = useCreateAccountFormContext();

  const descriptionField = useField({ form, name: 'description' });
  const notesField = useField({ form, name: 'zimbraNotes' });

  return (
    <>
      <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
        <div className="flex flex-wrap justify-center pt-lg">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.description', 'Description')}
          </ds-text>
        </div>
        <div className="flex w-full flex-wrap justify-center pt-lg pl-lg">
          <TextInput
            label={t('label.description', 'Description')}
            name="description"
            autoComplete="off"
            value={descriptionField.state.value ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              descriptionField.handleChange(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap justify-start pt-lg pl-sm">
        <div className="flex flex-wrap justify-center pt-lg">
          <ds-text size="small" color="gray0" weight="bold" as="h2">
            {t('label.notes', 'Notes')}
          </ds-text>
        </div>
        <div className="flex w-full flex-wrap justify-center pt-lg pl-lg">
          <PlainTextarea
            label={t('label.notes', 'Notes')}
            name="zimbraNotes"
            value={notesField.state.value ?? ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
              notesField.handleChange(e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
};
