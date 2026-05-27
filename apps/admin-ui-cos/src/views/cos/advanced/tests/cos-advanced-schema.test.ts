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
    expect(issuesFor({ zimbraPasswordMinLength: '', zimbraQuotaWarnPercent: '' })).toEqual([]);
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

  it('enforces the 0-100 range for the quota warning percent', () => {
    expect(issuesFor({ zimbraQuotaWarnPercent: '100' })).toEqual([]);
    expect(issuesFor({ zimbraQuotaWarnPercent: '101' })).toEqual([
      { path: 'zimbraQuotaWarnPercent', message: 'cos.validation.percent_range' },
    ]);
  });

  it('accepts duration values with an optional unit and rejects garbage', () => {
    expect(issuesFor({ zimbraMailMessageLifetime: '7d' })).toEqual([]);
    expect(issuesFor({ zimbraMailMessageLifetime: '30' })).toEqual([]);
    expect(issuesFor({ zimbraMailMessageLifetime: 'abc' })).toEqual([
      { path: 'zimbraMailMessageLifetime', message: 'cos.validation.invalid_duration' },
    ]);
  });

  it('requires max password length to be >= min password length', () => {
    expect(
      issuesFor({ zimbraPasswordMinLength: '10', zimbraPasswordMaxLength: '3' }),
    ).toEqual([
      { path: 'zimbraPasswordMaxLength', message: 'cos.validation.max_less_than_min_length' },
    ]);
    expect(
      issuesFor({ zimbraPasswordMinLength: '3', zimbraPasswordMaxLength: '10' }),
    ).toEqual([]);
  });

  it('requires max password age to be >= min password age', () => {
    expect(issuesFor({ zimbraPasswordMinAge: '30', zimbraPasswordMaxAge: '7' })).toEqual([
      { path: 'zimbraPasswordMaxAge', message: 'cos.validation.max_less_than_min_age' },
    ]);
  });

  it('does not run cross-field checks while either side is still invalid', () => {
    // Only the single-field error should surface, not the comparison.
    expect(issuesFor({ zimbraPasswordMinLength: 'abc', zimbraPasswordMaxLength: '3' })).toEqual([
      { path: 'zimbraPasswordMinLength', message: 'cos.validation.non_negative_integer' },
    ]);
  });
});
