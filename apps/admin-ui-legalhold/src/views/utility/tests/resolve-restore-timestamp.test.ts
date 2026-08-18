/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import {
  endOfDayTimestamp,
  resolveRestoreTimestamp,
  startOfDayTimestamp,
} from '../resolve-restore-timestamp';

describe('resolveRestoreTimestamp', () => {
  it('should return undefined when no date is requested', () => {
    expect(resolveRestoreTimestamp({})).toBeUndefined();
  });

  it('should clamp a future date to now', () => {
    const future = Date.now() + 86_400_000;
    const result = resolveRestoreTimestamp({ requestedDate: future });

    expect(result).toBeLessThanOrEqual(Date.now());
  });

  it('should clamp to the deleted timestamp when the request is later', () => {
    expect(
      resolveRestoreTimestamp({
        requestedDate: 200,
        deletedTimestamp: 150,
      }),
    ).toBe(150);
  });

  it('should clamp to the creation timestamp when the request is earlier', () => {
    expect(
      resolveRestoreTimestamp({
        requestedDate: 50,
        creationTimestamp: 100,
        deletedTimestamp: 200,
      }),
    ).toBe(100);
  });
});

describe('day timestamp helpers', () => {
  it('should return the end of the given day', () => {
    const date = new Date('2025-01-01T10:00:00');
    const result = new Date(endOfDayTimestamp(date));

    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });

  it('should return the start of the given day', () => {
    const date = new Date('2025-01-01T10:00:00');
    const result = new Date(startOfDayTimestamp(date));

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('should not mutate the original date', () => {
    const date = new Date('2025-01-01T10:00:00');
    endOfDayTimestamp(date);
    expect(date.getHours()).toBe(10);
  });
});
