/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';

import {
  EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
  type ExposeAddressBookFormValues,
  exposeAddressBookSchema,
} from './expose-address-book-schema';

export function useExposeAddressBookForm(
  hasAllShared: boolean,
  defaultValues: ExposeAddressBookFormValues = EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
) {
  const [t] = useTranslation();

  return useForm({
    defaultValues,
    validators: {
      onChange: exposeAddressBookSchema(hasAllShared, t),
    },
  });
}
