/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildCosLimitEntries } from '../domain-cos-limits-rows';

const COS_LIST = [
  { id: 'cos-default', name: 'default' },
  { id: 'cos-gold', name: 'Gold' },
  { id: 'cos-silver', name: 'Silver' },
];

describe('buildCosLimitEntries', () => {
  it('should unite the linked COSes with the COSes that have accounts, sorted by name', () => {
    const entries = buildCosLimitEntries(
      [
        { n: 'zimbraDomainName', _content: 'example.com' },
        { n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-gold:50' },
        { n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-silver:-1' },
      ],
      COS_LIST,
      [
        { name: 'default', count: 4 },
        { name: 'Gold', count: 12 },
      ],
    );

    expect(entries).toEqual([
      { name: 'default', used: 4, maxAccounts: undefined },
      { name: 'Gold', used: 12, maxAccounts: '50' },
      { name: 'Silver', used: 0, maxAccounts: '-1' },
    ]);
  });

  it('should skip unlinked COSes without accounts', () => {
    const entries = buildCosLimitEntries([], COS_LIST, [
      { name: 'default', count: 0 },
      { name: 'Gold', count: 2 },
    ]);

    expect(entries).toEqual([{ name: 'Gold', used: 2, maxAccounts: undefined }]);
  });

  it('should fall back to the COS id when the linked COS is not in the visible COS list', () => {
    const entries = buildCosLimitEntries(
      [{ n: 'zimbraDomainCOSMaxAccounts', _content: 'cos-hidden:5' }],
      COS_LIST,
      [],
    );

    expect(entries).toEqual([{ name: 'cos-hidden', used: 0, maxAccounts: '5' }]);
  });

  it('should return no entries while the data is loading', () => {
    expect(buildCosLimitEntries(undefined, undefined, undefined)).toEqual([]);
  });
});
