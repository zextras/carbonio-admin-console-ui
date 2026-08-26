/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { parseDirectoryAccounts } from '../parse-address-book-accounts';

describe('parseDirectoryAccounts', () => {
  it('maps id and name from directory entries', () => {
    expect(
      parseDirectoryAccounts({
        account: [
          { id: 'acc-1', name: 'alice@example.com', a: [] },
          { id: 'acc-2', name: 'bob@example.com', a: [] },
        ],
        dl: [],
        alias: [],
        calresource: [],
      }),
    ).toEqual([
      { id: 'acc-1', name: 'alice@example.com' },
      { id: 'acc-2', name: 'bob@example.com' },
    ]);
  });

  it('returns an empty list when no accounts are present', () => {
    expect(parseDirectoryAccounts({ dl: [], alias: [], calresource: [] })).toEqual([]);
  });
});
