/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getStatusDisplay } from '../status';

const t = (_key: string, defaultValue: string): string => defaultValue;

describe('getStatusDisplay', () => {
  it('returns color and translated label for a known status', () => {
    expect(getStatusDisplay('active', t)).toEqual({ color: 'success', label: 'Active' });
  });

  it('includes the suspended status', () => {
    expect(getStatusDisplay('suspended', t)).toEqual({ color: 'error', label: 'Suspended' });
  });

  it.each(['maintenance', 'locked', 'closed', 'pending', 'lockout'])(
    'resolves known status "%s" without throwing',
    (status) => {
      const result = getStatusDisplay(status, t);
      expect(result.color).toBeTruthy();
      expect(result.label).toBeTruthy();
    },
  );

  it('falls back gracefully for an unknown status without throwing', () => {
    expect(getStatusDisplay('totally-unknown-status', t)).toEqual({
      color: 'gray1',
      label: 'Active',
    });
  });

  it('passes the i18n key through to the translator', () => {
    const keys: Array<string> = [];
    const trackingT = (key: string, defaultValue: string): string => {
      keys.push(key);
      return defaultValue;
    };
    getStatusDisplay('locked', trackingT);
    expect(keys).toContain('label.locked');
  });
});
