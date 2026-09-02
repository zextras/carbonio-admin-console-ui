/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { buildCreateListAttributes } from '../build-create-list-attributes';

const DETAIL = {
  prefixName: 'announce',
  suffixName: 'example.com',
  description: 'All announcements',
  dynamic: false,
  displayName: 'Announce List',
  zimbraHideInGal: false,
  zimbraMailStatus: true,
  zimbraNotes: 'notes',
  memberURL: '',
  members: [],
  zimbraDistributionListSendShareMessageToNewMembers: true,
  owners: [],
  ownerGrantEmailType: undefined,
  ownerGrantEmails: [],
};

describe('buildCreateListAttributes', () => {
  it('builds the base attributes for a static list', () => {
    expect(buildCreateListAttributes(DETAIL)).toEqual([
      { n: 'displayName', _content: 'Announce List' },
      { n: 'zimbraNotes', _content: 'notes' },
      { n: 'zimbraHideInGal', _content: 'FALSE' },
      { n: 'zimbraMailStatus', _content: 'enabled' },
      {
        n: 'zimbraDistributionListSendShareMessageToNewMembers',
        _content: 'TRUE',
      },
      { n: 'description', _content: 'All announcements' },
    ]);
  });

  it('marks a dynamic list without member URL as ACL group', () => {
    const attributes = buildCreateListAttributes({ ...DETAIL, dynamic: true });
    expect(attributes).toEqual(
      expect.arrayContaining([
        { n: 'zimbraIsACLGroup', _content: 'TRUE' },
        { n: 'memberURL', _content: '' },
      ]),
    );
    expect(
      attributes.find((item) => item.n === 'zimbraDistributionListSendShareMessageToNewMembers'),
    ).toBeUndefined();
  });

  it('marks a dynamic list with member URL as not ACL group', () => {
    const attributes = buildCreateListAttributes({
      ...DETAIL,
      dynamic: true,
      memberURL: 'ldap://example.com',
    });
    expect(attributes).toEqual(
      expect.arrayContaining([
        { n: 'zimbraIsACLGroup', _content: 'FALSE' },
        { n: 'memberURL', _content: 'ldap://example.com' },
      ]),
    );
  });

  it('maps disabled mail status', () => {
    const attributes = buildCreateListAttributes({ ...DETAIL, zimbraMailStatus: false });
    expect(attributes.find((item) => item.n === 'zimbraMailStatus')).toEqual({
      n: 'zimbraMailStatus',
      _content: 'disabled',
    });
  });
});
