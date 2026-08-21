/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  buildAccountCoreAttributesRequest,
  parseAccountCoreAttributes,
} from '../use-account-core-attributes';

describe('use-account-core-attributes', () => {
  describe('buildAccountCoreAttributesRequest', () => {
    it('builds the request for the account core attributes', () => {
      expect(buildAccountCoreAttributesRequest('account-id')).toEqual([
        {
          configType: 'account',
          configName: ['account-id'],
          attrName: ['abqMode', 'backupEnabled', 'backupSelfUndeleteAllowed'],
        },
      ]);
    });
  });

  describe('parseAccountCoreAttributes', () => {
    it('parses boolean and string attributes', () => {
      expect(
        parseAccountCoreAttributes({
          attributes: {
            abqMode: [{ value: 'permissive' }],
            backupEnabled: [{ value: 'TRUE' }],
            backupSelfUndeleteAllowed: [{ value: '' }],
          },
        }),
      ).toEqual({
        abqMode: 'permissive',
        backupEnabled: true,
        backupSelfUndeleteAllowed: false,
      });
    });

    it('defaults missing attributes', () => {
      expect(parseAccountCoreAttributes({ attributes: {} })).toEqual({
        abqMode: undefined,
        backupEnabled: false,
        backupSelfUndeleteAllowed: false,
      });
    });

    it('maps an empty abqMode to undefined', () => {
      const parsed = parseAccountCoreAttributes({
        attributes: { abqMode: [{ value: '' }] },
      });
      expect(parsed.abqMode).toBeUndefined();
    });
  });
});
