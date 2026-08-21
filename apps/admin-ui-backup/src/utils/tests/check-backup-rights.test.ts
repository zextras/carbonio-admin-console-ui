/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { checkAllowSetBackup } from '../check-backup-rights';

describe('checkAllowSetBackup', () => {
  it('returns true when CONFIG rights have setAttrs.all true', () => {
    const rights = [
      { type: 'server', all: [{ setAttrs: [{ all: true }] }] },
      { type: 'config', all: [{ setAttrs: [{ all: true }] }] },
    ];
    expect(checkAllowSetBackup(rights)).toBe(true);
  });

  it('returns false when no CONFIG rights entry exists', () => {
    expect(checkAllowSetBackup(undefined)).toBe(false);
    expect(checkAllowSetBackup([])).toBe(false);
    expect(checkAllowSetBackup([{ type: 'server', all: [] }])).toBe(false);
  });

  it('returns false when setAttrs.all is false', () => {
    const rights = [{ type: 'config', all: [{ setAttrs: [{ all: false }] }] }];
    expect(checkAllowSetBackup(rights)).toBe(false);
  });

  it('returns false when setAttrs is missing', () => {
    const rights = [{ type: 'config', all: [{}] }];
    expect(checkAllowSetBackup(rights)).toBe(false);
  });

  it('returns false when all array is empty', () => {
    const rights = [{ type: 'config', all: [] }];
    expect(checkAllowSetBackup(rights)).toBe(false);
  });

  it('returns true when setAttrs.all is truthy', () => {
    const rights = [{ type: 'config', all: [{ setAttrs: [{ all: true }] }] }];
    expect(checkAllowSetBackup(rights)).toBe(true);
  });
});
