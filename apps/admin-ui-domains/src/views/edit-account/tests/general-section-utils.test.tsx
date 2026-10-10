/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';

import {
  domainAttrsToObject,
  filterSessions,
  formatZimbraDateOr,
  getAccountUserType,
  hasExternalLdapUrl,
  isLdapAuthWithoutFallback,
  somethingWrongSnackbarConfig,
  type UserSession,
} from '../general-section/utils';

const t = ((key: string, fallback?: string) => fallback ?? key) as unknown as TFunction;

const sessions: Array<UserSession> = [
  { name: 'user@example.com', sid: 'sid-1', zid: 'zid-1', ip: '10.0.0.1', service: 'imap' },
  { name: 'other@example.com', sid: 'sid-2', zid: 'zid-2', ip: '10.0.0.2', service: 'soap' },
];

describe('domainAttrsToObject', () => {
  it('maps an attribute list to a key-value object', () => {
    expect(
      domainAttrsToObject([
        { n: 'zimbraAuthMech', _content: 'ldap' },
        { n: 'zimbraAuthFallbackToLocal', _content: 'TRUE' },
      ]),
    ).toEqual({
      zimbraAuthMech: 'ldap',
      zimbraAuthFallbackToLocal: 'TRUE',
    });
  });
});

describe('isLdapAuthWithoutFallback', () => {
  it('returns false when attrs are missing or empty', () => {
    expect(isLdapAuthWithoutFallback(undefined)).toBe(false);
    expect(isLdapAuthWithoutFallback([])).toBe(false);
  });

  it('returns true for ldap auth without local fallback', () => {
    expect(isLdapAuthWithoutFallback([{ n: 'zimbraAuthMech', _content: 'ldap' }])).toBe(true);
  });

  it('returns false when the local fallback is enabled', () => {
    expect(
      isLdapAuthWithoutFallback([
        { n: 'zimbraAuthMech', _content: 'ldap' },
        { n: 'zimbraAuthFallbackToLocal', _content: 'TRUE' },
      ]),
    ).toBe(false);
  });

  it('returns false for non-ldap auth methods', () => {
    expect(isLdapAuthWithoutFallback([{ n: 'zimbraAuthMech', _content: 'zimbra' }])).toBe(false);
    expect(isLdapAuthWithoutFallback([{ n: 'zimbraAuthMech', _content: 'ad' }])).toBe(false);
  });
});

describe('hasExternalLdapUrl', () => {
  it('returns false when attrs are missing or empty', () => {
    expect(hasExternalLdapUrl(undefined)).toBe(false);
    expect(hasExternalLdapUrl([])).toBe(false);
  });

  it('returns true when an ldap url is set', () => {
    expect(
      hasExternalLdapUrl([{ n: 'zimbraAuthLdapURL', _content: 'ldaps://ldap.example.com' }]),
    ).toBe(true);
  });

  it('returns false when the ldap url is an empty string', () => {
    expect(hasExternalLdapUrl([{ n: 'zimbraAuthLdapURL', _content: '' }])).toBe(false);
  });
});

describe('getAccountUserType', () => {
  it('prefers admin over every other flag', () => {
    expect(getAccountUserType(true, true, true, true)).toBe('Admin');
  });

  it('returns each type based on the flag priority', () => {
    expect(getAccountUserType(false, true, true, true)).toBe('DelegatedAdmin');
    expect(getAccountUserType(false, false, true, true)).toBe('External');
    expect(getAccountUserType(false, false, false, true)).toBe('System');
  });

  it('returns Normal when no flag is set', () => {
    expect(getAccountUserType(false, false, false, false)).toBe('Normal');
  });
});

describe('filterSessions', () => {
  it('returns the whole list for an empty filter', () => {
    expect(filterSessions(sessions, '')).toEqual(sessions);
  });

  it('matches sessions by name or by sid', () => {
    expect(filterSessions(sessions, 'other@example.com')).toEqual([sessions[1]]);
    expect(filterSessions(sessions, 'sid-1')).toEqual([sessions[0]]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterSessions(sessions, 'nobody')).toEqual([]);
  });
});

describe('formatZimbraDateOr', () => {
  it('formats a zimbra timestamp', () => {
    expect(formatZimbraDateOr('20260615100000.000Z', 'never')).toBe('15 Jun 2026 | 10:00:00 AM');
  });

  it('returns the fallback for missing timestamps', () => {
    expect(formatZimbraDateOr(undefined, 'Never logged in')).toBe('Never logged in');
    expect(formatZimbraDateOr(null, 'Never logged in')).toBe('Never logged in');
  });
});

describe('somethingWrongSnackbarConfig', () => {
  it('uses the error message when available', () => {
    expect(somethingWrongSnackbarConfig({ message: 'boom' }, t)).toEqual({
      key: 'error',
      severity: 'error',
      label: 'boom',
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  });

  it('falls back to the translated generic message', () => {
    expect(somethingWrongSnackbarConfig({}, t).label).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
