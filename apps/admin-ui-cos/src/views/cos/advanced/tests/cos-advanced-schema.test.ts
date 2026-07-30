/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { cosAdvancedSchema } from '../schema';

const base = { backupEnabled: false, backupSelfUndeleteAllowed: false };

function issuesFor(input: Record<string, unknown>): Array<{ path: string; message: string }> {
  const result = cosAdvancedSchema.safeParse({ ...base, ...input });
  return result.success
    ? []
    : result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
}

describe('cosAdvancedSchema', () => {
  it('treats empty values as valid (inherit / no limit)', () => {
    expect(issuesFor({ zimbraPasswordMinLength: '', zimbraContactMaxNumEntries: '' })).toEqual([]);
  });

  it('accepts non-negative integers', () => {
    expect(issuesFor({ zimbraPasswordMinLength: '8' })).toEqual([]);
  });

  it('rejects negative numbers', () => {
    expect(issuesFor({ zimbraPasswordMinLength: '-3' })).toEqual([
      { path: 'zimbraPasswordMinLength', message: 'cos.validation.non_negative_integer' },
    ]);
  });

  it('rejects non-numeric input', () => {
    expect(issuesFor({ zimbraContactMaxNumEntries: 'abc' })).toEqual([
      { path: 'zimbraContactMaxNumEntries', message: 'cos.validation.non_negative_integer' },
    ]);
  });

  it('rejects decimals on integer fields', () => {
    expect(issuesFor({ zimbraPasswordMaxLength: '1.5' })).toEqual([
      { path: 'zimbraPasswordMaxLength', message: 'cos.validation.non_negative_integer' },
    ]);
  });

  it('accepts duration values with an optional unit and rejects garbage', () => {
    expect(issuesFor({ zimbraMailMessageLifetime: '7d' })).toEqual([]);
    expect(issuesFor({ zimbraMailMessageLifetime: '30' })).toEqual([]);
    expect(issuesFor({ zimbraMailMessageLifetime: 'abc' })).toEqual([
      { path: 'zimbraMailMessageLifetime', message: 'cos.validation.invalid_duration' },
    ]);
  });
});
