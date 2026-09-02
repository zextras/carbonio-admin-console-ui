/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  getDomainAttributeValue,
  getSamlAttributes,
  getSpEndpoints,
  samlAttributeValueToString,
} from './utils';

describe('getSamlAttributes', () => {
  it('maps config entries to attribute objects', () => {
    expect(getSamlAttributes({ samlKey: 'samlValue', audience: 'https://sp.example.com' })).toEqual(
      [
        { attribute: 'samlKey', value: 'samlValue' },
        { attribute: 'audience', value: 'https://sp.example.com' },
      ],
    );
  });

  it('returns an empty array when the config is undefined', () => {
    expect(getSamlAttributes(undefined)).toEqual([]);
  });
});

describe('getDomainAttributeValue', () => {
  it('finds the first matching attribute content', () => {
    expect(
      getDomainAttributeValue(
        [{ n: 'zimbraPublicServiceProtocol', _content: 'https' }],
        'zimbraPublicServiceProtocol',
      ),
    ).toBe('https');
  });

  it('returns an empty string when the attribute is missing', () => {
    expect(
      getDomainAttributeValue([{ n: 'other', _content: 'x' }], 'zimbraPublicServiceProtocol'),
    ).toBe('');
  });

  it('returns an empty string when domain information is undefined', () => {
    expect(getDomainAttributeValue(undefined, 'zimbraPublicServiceProtocol')).toBe('');
  });
});

describe('getSpEndpoints', () => {
  const domainInformation = [
    { n: 'zimbraPublicServiceProtocol', _content: 'https' },
    { n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
  ];

  it('builds the entity id and service url from the public service attributes', () => {
    expect(getSpEndpoints(domainInformation, 'example.com')).toEqual({
      entityId: 'https://mail.example.com/zx/auth/samlMetadata?domain=example.com',
      serviceUrl: 'https://mail.example.com/zx/auth/saml',
    });
  });

  it('defaults the protocol to https when missing', () => {
    expect(
      getSpEndpoints(
        [{ n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' }],
        'example.com',
      ),
    ).toEqual({
      entityId: 'https://mail.example.com/zx/auth/samlMetadata?domain=example.com',
      serviceUrl: 'https://mail.example.com/zx/auth/saml',
    });
  });

  it('returns empty endpoints when the public service hostname is missing', () => {
    expect(getSpEndpoints([], 'example.com')).toEqual({ entityId: '', serviceUrl: '' });
  });
});

describe('samlAttributeValueToString', () => {
  it('returns the value itself when it is a string', () => {
    expect(samlAttributeValueToString('https://idp.example.com')).toBe('https://idp.example.com');
  });

  it('converts a number to a string', () => {
    expect(samlAttributeValueToString(42)).toBe('42');
  });

  it('converts a boolean to a string', () => {
    expect(samlAttributeValueToString(true)).toBe('true');
    expect(samlAttributeValueToString(false)).toBe('false');
  });

  it('joins array values with a comma', () => {
    expect(samlAttributeValueToString(['one', 'two'])).toBe('one,two');
  });

  it('recursively flattens nested arrays', () => {
    expect(samlAttributeValueToString(['one', ['two', 'three'], 4, true])).toBe(
      'one,two,three,4,true',
    );
  });

  it('returns an empty string for unsupported values', () => {
    expect(samlAttributeValueToString(null)).toBe('');
    expect(samlAttributeValueToString(undefined)).toBe('');
    expect(samlAttributeValueToString({ key: 'value' })).toBe('');
    expect(samlAttributeValueToString([{ key: 'value' }, { key: 'other' }])).toBe(',');
  });
});
