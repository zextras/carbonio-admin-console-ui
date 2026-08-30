/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { MAX_DOMAIN_DISPLAY } from '../../../constants';
import {
  buildDomainDropdownItems,
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

describe('buildDomainDropdownItems', () => {
  it('returns one clickable row per domain', () => {
    const onSelectedDomain = vi.fn();
    const items = buildDomainDropdownItems(
      [
        { id: 'domain-1', name: 'one.example.com' },
        { id: 'domain-2', name: 'two.example.com' },
      ],
      onSelectedDomain,
      t,
    );
    expect(items).toHaveLength(2);
    const [first] = items;
    if (!first) {
      throw new Error('expected a dropdown item');
    }
    expect(first.id).toBe('domain-1');
    expect(first.label).toBe('one.example.com');

    render(first.customComponent);
    fireEvent.click(screen.getByText('one.example.com'));

    expect(onSelectedDomain).toHaveBeenCalledWith('one.example.com');
  });

  it('returns a single hint entry when the domain list exceeds the display limit', () => {
    const onSelectedDomain = vi.fn();
    const domainList = Array.from({ length: MAX_DOMAIN_DISPLAY + 1 }, (_, index) => ({
      id: `domain-${index}`,
      name: `domain-${index}.example.com`,
    }));
    const items = buildDomainDropdownItems(domainList, onSelectedDomain, t);
    expect(items).toHaveLength(1);
    const [hint] = items;
    if (!hint) {
      throw new Error('expected a hint item');
    }
    expect(hint.id).toBeUndefined();
    expect(hint.label).toBeUndefined();

    render(hint.customComponent);
    expect(
      screen.getByText('So many domains! Which one would you like to see? Start typing to filter.'),
    ).toBeTruthy();
    expect(onSelectedDomain).not.toHaveBeenCalled();
  });
});
