/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

import { isValidEmail } from '../../utility/utils';

export type FolderMode = 'all' | 'specific';

export type ExposeAddressBookFormValues = {
  account: string;
  selectedAccount: string;
  folderMode: FolderMode;
  folderId: string;
};

export const EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES: ExposeAddressBookFormValues = {
  account: '',
  selectedAccount: '',
  folderMode: 'all',
  folderId: '',
};

type TranslateFn = (key: string, defaultValue: string) => string;

export function exposeAddressBookSchema(hasAllShared: boolean, t: TranslateFn) {
  return z
    .object({
      account: z.string(),
      selectedAccount: z.string(),
      folderMode: z.enum(['all', 'specific']),
      folderId: z.string(),
    })
    .superRefine((values, ctx) => {
      const trimmed = values.account.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['account'],
          message: t('label.account_is_required', 'Account is required'),
        });
      } else if (!isValidEmail(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          path: ['account'],
          message: t('label.enter_a_valid_email_address', 'Enter a valid email address'),
        });
      }

      if (values.selectedAccount === '' || !isValidEmail(values.selectedAccount)) {
        ctx.addIssue({
          code: 'custom',
          path: ['selectedAccount'],
          message: t('label.select_a_valid_account_first', 'Select a valid account first'),
        });
      }

      if (values.folderMode === 'all' && hasAllShared) {
        ctx.addIssue({
          code: 'custom',
          path: ['folderMode'],
          message: t(
            'label.all_address_books_already_exposed',
            'All address books of this account are already exposed.',
          ),
        });
      }

      if (values.folderMode === 'specific' && values.folderId === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['folderId'],
          message: t('label.select_an_address_book', 'Select an address book'),
        });
      }
    });
}
