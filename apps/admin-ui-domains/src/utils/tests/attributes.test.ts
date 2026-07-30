/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Attribute } from '../../../types';
import { attributesToObject, parseDomainAttributes } from '../attributes';

describe('attributesToObject', () => {
  it('builds a record keyed by the attribute name', () => {
    const attrs: Array<Attribute> = [
      { n: 'zimbraDomainStatus', _content: 'locked' },
      { n: 'zimbraId', _content: 'abc-123' },
    ];
    expect(attributesToObject(attrs)).toEqual({
      zimbraDomainStatus: 'locked',
      zimbraId: 'abc-123',
    });
  });

  it('returns an empty object for an empty array', () => {
    expect(attributesToObject([])).toEqual({});
  });

  it('keeps the last value when a key repeats', () => {
    const attrs: Array<Attribute> = [
      { n: 'zimbraDomainStatus', _content: 'active' },
      { n: 'zimbraDomainStatus', _content: 'locked' },
    ];
    expect(attributesToObject(attrs)).toEqual({ zimbraDomainStatus: 'locked' });
  });
});

describe('parseDomainAttributes', () => {
  it('maps all four domain attribute keys', () => {
    const attrs: Array<Attribute> = [
      { n: 'zimbraDomainType', _content: 'local' },
      { n: 'zimbraDomainStatus', _content: 'suspended' },
      { n: 'zimbraDomainName', _content: 'example.com' },
      { n: 'zimbraId', _content: 'id-1' },
    ];
    expect(parseDomainAttributes(attrs)).toEqual({
      zimbraDomainType: 'local',
      zimbraDomainStatus: 'suspended',
      zimbraDomainName: 'example.com',
      zimbraId: 'id-1',
    });
  });

  it('defaults zimbraDomainStatus to active when absent', () => {
    expect(parseDomainAttributes([]).zimbraDomainStatus).toBe('active');
  });

  it('defaults the non-status fields to empty strings when absent', () => {
    const result = parseDomainAttributes([]);
    expect(result.zimbraDomainType).toBe('');
    expect(result.zimbraDomainName).toBe('');
    expect(result.zimbraId).toBe('');
  });

  it('does not throw for an empty array', () => {
    expect(() => parseDomainAttributes([])).not.toThrow();
  });
});
