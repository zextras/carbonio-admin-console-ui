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

describe('mergeFolderGrants admin grants', () => {
  const adminGrants = [
    { grantee: [{ id: 'z1', name: 'delegate@x.com', type: 'usr' }], right: [{ _content: 'viewFreeBusy' }] },
    { grantee: [{ id: 'z1', name: 'delegate@x.com', type: 'usr' }], right: [{ _content: 'sendAs' }] },
    { grantee: [{ id: 'z1', name: 'delegate@x.com', type: 'usr' }], right: [{ _content: 'sendOnBehalfOf' }] },
  ];

  it('collapses one entry per right into a single identity with send rights first', () => {
    const result = mergeFolderGrants([], adminGrants);
    expect(result.identitiesList).toHaveLength(1);
    expect(result.identitiesList[0].right.map((r: { _content: string }) => r._content)).toEqual([
      'sendAs',
      'sendOnBehalfOf',
      'viewFreeBusy',
    ]);
  });

  it('attaches folder grants to the merged identity, matching the name case-insensitively', () => {
    const upperCase = [
      { id: '1', name: 'USER_ROOT', acl: { grant: [{ d: 'Delegate@X.com', gt: 'usr', zid: 'z1', perm: 'r' }] } },
    ];
    const result = mergeFolderGrants(upperCase, adminGrants);
    expect(result.identitiesList).toHaveLength(1);
    expect(result.identitiesList[0].folder).toHaveLength(1);
  });

  it('ignores folder shares that are not user or group delegates', () => {
    const shares = [
      {
        id: '1',
        name: 'USER_ROOT',
        acl: {
          grant: [
            { gt: 'pub', zid: '99999999-9999-9999-9999-999999999999', perm: 'r' },
            { gt: 'all', zid: '00000000-0000-0000-0000-000000000000', perm: 'r' },
            { d: 'x.com', gt: 'dom', zid: 'd1', perm: 'r' },
            { d: 'guest@y.com', gt: 'guest', zid: 'guest@y.com', perm: 'r' },
          ],
        },
      },
    ];
    expect(mergeFolderGrants(shares).identitiesList).toEqual([]);
  });

  it('does not mutate the grants it receives', () => {
    const snapshot = JSON.stringify(adminGrants);
    mergeFolderGrants(folders, adminGrants);
    expect(JSON.stringify(adminGrants)).toBe(snapshot);
  });
});
