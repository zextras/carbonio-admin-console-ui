/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { generateAccountSearchFilterQuery, generateDomainSearchFilterQuery } from '../cos-search-utils';

describe('generateAccountSearchFilterQuery', () => {
  it('should return base filter with no search string', () => {
    const result = generateAccountSearchFilterQuery('', 'cos-123');
    expect(result).toBe('(&(zimbraCOSId=cos-123)(!(zimbraIsSystemAccount=TRUE)))');
  });

  it('should include all searchable fields when search string is provided', () => {
    const result = generateAccountSearchFilterQuery('alice', 'cos-123');
    expect(result).toContain('(mail=*alice*)');
    expect(result).toContain('(cn=*alice*)');
    expect(result).toContain('(sn=*alice*)');
    expect(result).toContain('(gn=*alice*)');
    expect(result).toContain('(displayName=*alice*)');
    expect(result).toContain('(zimbraMailDeliveryAddress=*alice*)');
  });

  it('should wrap the entire filter in (&...) when search string is provided', () => {
    const result = generateAccountSearchFilterQuery('alice', 'cos-123');
    expect(result.startsWith('(&')).toBe(true);
    expect(result.endsWith(')')).toBe(true);
    expect(result).toBe(
      '(&(&(zimbraCOSId=cos-123)(!(zimbraIsSystemAccount=TRUE)))(|(mail=*alice*)(cn=*alice*)(sn=*alice*)(gn=*alice*)(displayName=*alice*)(zimbraMailDeliveryAddress=*alice*)))',
    );
  });

  it('should handle undefined cosIdVal', () => {
    const result = generateAccountSearchFilterQuery('', undefined);
    expect(result).toBe('(&(zimbraCOSId=undefined)(!(zimbraIsSystemAccount=TRUE)))');
  });
});

describe('generateDomainSearchFilterQuery', () => {
  it('should return base filter with no search string', () => {
    const result = generateDomainSearchFilterQuery('', 'cos-123');
    expect(result).toBe(
      '(|(zimbraDomainCOSMaxAccounts=cos-123*)(zimbraDomainDefaultCOSId=cos-123))',
    );
  });

  it('should include domain name subfilter when search string is provided', () => {
    const result = generateDomainSearchFilterQuery('example', 'cos-123');
    expect(result).toContain('(zimbraDomainName=*example*)');
  });

  it('should wrap the entire filter in (&...) when search string is provided', () => {
    const result = generateDomainSearchFilterQuery('example', 'cos-123');
    expect(result).toBe(
      '(&(|(zimbraDomainCOSMaxAccounts=cos-123*)(zimbraDomainDefaultCOSId=cos-123))(|(zimbraDomainName=*example*)))',
    );
  });

  it('should handle undefined cosIdVal', () => {
    const result = generateDomainSearchFilterQuery('', undefined);
    expect(result).toBe(
      '(|(zimbraDomainCOSMaxAccounts=undefined*)(zimbraDomainDefaultCOSId=undefined))',
    );
  });
});
