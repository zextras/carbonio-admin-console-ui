/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  buildDisclaimerDomainAttributes,
  encodeDisclaimerHtml,
  getDefaultDisclaimerFormValues,
  normalizeDisclaimerText,
} from './utils';

describe('normalizeDisclaimerText', () => {
  it('replaces diacritics with an apostrophe after NFD decomposition', () => {
    expect(normalizeDisclaimerText('café')).toBe("cafe'");
  });

  it('wraps content with a newline every 997 characters', () => {
    const wrapped = normalizeDisclaimerText('a'.repeat(2000));
    const lines = wrapped.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveLength(997);
    expect(lines[1]).toHaveLength(997);
    expect(lines[2]).toHaveLength(6);
  });

  it('leaves short plain text untouched', () => {
    expect(normalizeDisclaimerText('hello')).toBe('hello');
  });
});

describe('encodeDisclaimerHtml', () => {
  it('encodes non-ascii printable chars into html entities', () => {
    expect(encodeDisclaimerHtml('<p>Ünicödé</p>')).toBe('<p>&Uuml;nic&ouml;d&eacute;</p>');
  });

  it('keeps ascii content untouched', () => {
    expect(encodeDisclaimerHtml('<p>Hello & "world"</p>')).toBe('<p>Hello & "world"</p>');
  });
});

describe('buildDisclaimerDomainAttributes', () => {
  it('builds enabled attributes with transformed content and domain name', () => {
    expect(
      buildDisclaimerDomainAttributes(
        {
          zimbraDomainMandatoryMailSignatureEnabled: true,
          zimbraAmavisDomainDisclaimerText: 'café',
          zimbraAmavisDomainDisclaimerHTML: '<p>Ünicödé</p>',
        },
        'example.com',
      ),
    ).toEqual([
      { n: 'zimbraAmavisDomainDisclaimerText', _content: "cafe'" },
      { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>&Uuml;nic&ouml;d&eacute;</p>' },
      { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
      { n: 'amavisDisclaimerOptions', _content: 'example.com' },
    ]);
  });

  it('builds disabled attributes with empty disclaimer and options', () => {
    expect(
      buildDisclaimerDomainAttributes(
        {
          zimbraDomainMandatoryMailSignatureEnabled: false,
          zimbraAmavisDomainDisclaimerText: '',
          zimbraAmavisDomainDisclaimerHTML: '',
        },
        'example.com',
      ),
    ).toEqual([
      { n: 'zimbraAmavisDomainDisclaimerText', _content: '' },
      { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '' },
      { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'FALSE' },
      { n: 'amavisDisclaimerOptions', _content: '' },
    ]);
  });
});

describe('getDefaultDisclaimerFormValues', () => {
  it('maps domain attributes to form default values', () => {
    expect(
      getDefaultDisclaimerFormValues([
        { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
        { n: 'zimbraAmavisDomainDisclaimerText', _content: 'text' },
        { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>html</p>' },
      ]),
    ).toEqual({
      zimbraDomainMandatoryMailSignatureEnabled: true,
      zimbraAmavisDomainDisclaimerText: 'text',
      zimbraAmavisDomainDisclaimerHTML: '<p>html</p>',
    });
  });

  it('falls back to disabled and empty values when attributes are missing', () => {
    expect(getDefaultDisclaimerFormValues(undefined)).toEqual({
      zimbraDomainMandatoryMailSignatureEnabled: false,
      zimbraAmavisDomainDisclaimerText: '',
      zimbraAmavisDomainDisclaimerHTML: '',
    });
  });
});
