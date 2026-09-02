/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { flattenAccountAttrs, parseAccountDetail, parseSpecificAttrs } from '../use-account-detail';

// soapFetch unwraps Body: getAccountRequest resolves to the GetAccountResponse directly.
const getAccountResponse = (attrs: Array<{ n: string; _content: string }>): any => ({
  account: [{ id: 'id-1', name: 'jane@example.com', a: attrs }],
});

describe('parseAccountDetail', () => {
  it('flattens attrs, joins multi-value with ", ", masks password, defaults admin flags', () => {
    const res = getAccountResponse([
      { n: 'zimbraCOSId', _content: 'cos-1' },
      { n: 'mail', _content: 'a@x.com' },
      { n: 'mail', _content: 'b@x.com' },
      { n: 'userPassword', _content: 'secret' },
    ]);
    const parsed = parseAccountDetail(res);
    expect(parsed.zimbraCOSId).toBe('cos-1');
    expect(parsed.mail).toBe('a@x.com, b@x.com');
    expect(parsed.password).toBe('******');
    expect(parsed.repeatPassword).toBe('******');
    expect(parsed.zimbraIsAdminAccount).toBe('FALSE');
    expect(parsed.zimbraIsDelegatedAdminAccount).toBe('FALSE');
    expect(parsed.zimbraPrefMailForwardingAddress).toBe('');
    expect(parsed.zimbraPrefCalendarForwardInvitesTo).toBe('');
    expect(parsed.name).toBe('jane@example.com');
    expect(parsed.zimbraId).toBe('id-1');
  });

  it('leaves password empty when userPassword absent', () => {
    const parsed = parseAccountDetail(getAccountResponse([]));
    expect(parsed.password).toBe('');
    expect(parsed.repeatPassword).toBe('');
  });

  it('defaults boolean switch attrs to FALSE when absent from the server response', () => {
    const parsed = parseAccountDetail(getAccountResponse([{ n: 'sn', _content: 'Smith' }]));
    expect(parsed.zimbraHideInGal).toBe('FALSE');
    expect(parsed.zimbraPasswordMustChange).toBe('FALSE');
  });

  it('keeps explicit boolean switch attrs as returned by the server', () => {
    const parsed = parseAccountDetail(
      getAccountResponse([
        { n: 'zimbraHideInGal', _content: 'TRUE' },
        { n: 'zimbraPasswordMustChange', _content: 'TRUE' },
      ]),
    );
    expect(parsed.zimbraHideInGal).toBe('TRUE');
    expect(parsed.zimbraPasswordMustChange).toBe('TRUE');
  });
});

describe('flattenAccountAttrs', () => {
  it('returns empty object for missing attrs', () => {
    expect(flattenAccountAttrs(undefined)).toEqual({});
  });
});

describe('parseSpecificAttrs', () => {
  it('flattens attributes without edit-level defaults', () => {
    const parsed = parseSpecificAttrs(getAccountResponse([{ n: 'zimbraFeatureTasksEnabled', _content: 'TRUE' }]));
    expect(parsed.zimbraFeatureTasksEnabled).toBe('TRUE');
    expect(parsed.password).toBeUndefined();
    expect(parsed.name).toBeUndefined();
  });
});
