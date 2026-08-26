/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
  exposeAddressBookSchema,
} from '../expose-address-book-schema';

const t = (_key: string, fallback: string): string => fallback;

describe('exposeAddressBookSchema', () => {
  it('accepts a selected account with all-folders mode', () => {
    const result = exposeAddressBookSchema(false, t).safeParse({
      ...EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
      account: 'alice@example.com',
      selectedAccount: 'alice@example.com',
      folderMode: 'all',
    });
    expect(result.success).toBe(true);
  });

  it('requires an account', () => {
    const result = exposeAddressBookSchema(false, t).safeParse(EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'account')).toBe(true);
    }
  });

  it('rejects an invalid email', () => {
    const result = exposeAddressBookSchema(false, t).safeParse({
      ...EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
      account: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'account')).toBe(true);
    }
  });

  it('requires a folder when mode is specific', () => {
    const result = exposeAddressBookSchema(false, t).safeParse({
      ...EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
      account: 'alice@example.com',
      selectedAccount: 'alice@example.com',
      folderMode: 'specific',
      folderId: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'folderId')).toBe(true);
    }
  });

  it('rejects all-folders mode when everything is already exposed', () => {
    const result = exposeAddressBookSchema(true, t).safeParse({
      ...EXPOSE_ADDRESS_BOOK_DEFAULT_VALUES,
      account: 'alice@example.com',
      selectedAccount: 'alice@example.com',
      folderMode: 'all',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'folderMode')).toBe(true);
    }
  });
});
