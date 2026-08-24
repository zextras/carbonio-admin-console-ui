/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { mergeFolderGrants } from '../use-account-grants';

const folders = [
  { id: '2', name: 'Inbox', acl: { grant: [{ d: 'delegate@x.com', gt: 'usr', zid: 'z1' }] } },
  { id: '10', name: 'Sent', acl: { grant: [{ d: 'delegate@x.com', gt: 'usr', zid: 'z1' }] } },
];

describe('mergeFolderGrants', () => {
  it('groups folder grants by grantee name', () => {
    const result = mergeFolderGrants(folders);
    expect(result.identitiesList).toHaveLength(1);
    expect(result.identitiesList[0].grantee[0].name).toBe('delegate@x.com');
    expect(result.identitiesList[0].folder).toHaveLength(2);
  });

  it('keeps existing grant rows untouched when no folder matches', () => {
    const existing = [{ grantee: [{ id: 'z9', name: 'other@x.com', type: 'usr' }], folder: [] }];
    const result = mergeFolderGrants(folders, existing);
    expect(result.identitiesList).toHaveLength(2);
    expect(result.folderList).toBe(folders);
  });
});
