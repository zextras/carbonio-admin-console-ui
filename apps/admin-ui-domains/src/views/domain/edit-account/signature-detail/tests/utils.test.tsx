/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { buildSignatureRows, filterSignatures } from '../utils';

const SIGNATURES = [
  { id: 'sig-1', name: 'work signature' },
  { id: 'sig-2', name: 'personal signature' },
];

describe('filterSignatures', () => {
  it('should pass the list through for an empty search', () => {
    expect(filterSignatures(SIGNATURES, '')).toEqual(SIGNATURES);
  });

  it('should filter by name substring', () => {
    expect(filterSignatures(SIGNATURES, 'work')).toEqual([SIGNATURES[0]]);
  });

  it('should return an empty list when nothing matches', () => {
    expect(filterSignatures(SIGNATURES, 'holiday')).toEqual([]);
  });
});

describe('buildSignatureRows', () => {
  it('should build one row per signature with name column and metadata', () => {
    const rows = buildSignatureRows(SIGNATURES);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: 'sig-1', label: 'work signature', clickable: true });
    expect(rows[1]).toMatchObject({ id: 'sig-2', label: 'personal signature', clickable: true });
  });

  it('should return an empty array for an empty list', () => {
    expect(buildSignatureRows([])).toEqual([]);
  });
});
