/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { restoreAccountSchema } from './schema';

const validValues = {
  legalHoldPrefix: 'lh',
  fromDate: new Date('2025-01-15'),
  unDelete: false,
  undeleteFromDate: null,
};

function issuesFor(input: Record<string, unknown>): Array<{ path: string; message: string }> {
  const result = restoreAccountSchema.safeParse({ ...validValues, ...input });
  return result.success
    ? []
    : result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
}

describe('restoreAccountSchema', () => {
  it('accepts valid restore values', () => {
    expect(issuesFor({})).toEqual([]);
  });

  it('rejects a blank prefix', () => {
    expect(issuesFor({ legalHoldPrefix: '' })).toEqual([
      { path: 'legalHoldPrefix', message: 'legal_hold.legal_hold_prefix_blank_error' },
    ]);
  });

  it('rejects a missing from date', () => {
    expect(issuesFor({ fromDate: null })).toEqual([
      { path: 'fromDate', message: 'legal_hold.legal_hold_fromdate_blank_error' },
    ]);
  });
});
