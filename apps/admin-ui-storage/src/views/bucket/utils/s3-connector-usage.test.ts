/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  isUsageUnused,
  parseBackupUsage,
  parseVolumeUsage,
} from './s3-connector-usage';

describe('isUsageUnused', () => {
  it('should treat empty and unused values as unused', () => {
    expect(isUsageUnused(undefined)).toBe(true);
    expect(isUsageUnused(null)).toBe(true);
    expect(isUsageUnused('')).toBe(true);
    expect(isUsageUnused('unused')).toBe(true);
    expect(isUsageUnused('UNUSED')).toBe(true);
    expect(isUsageUnused('-')).toBe(true);
    expect(isUsageUnused('none')).toBe(true);
  });

  it('should treat non-empty arrays as in use', () => {
    expect(isUsageUnused([{ server: 'host' }])).toBe(false);
  });

  it('should treat other strings as in use', () => {
    expect(isUsageUnused('2')).toBe(false);
    expect(isUsageUnused('in-use')).toBe(false);
  });
});

describe('parseBackupUsage', () => {
  it('should return empty array for unused values', () => {
    expect(parseBackupUsage('unused')).toEqual([]);
    expect(parseBackupUsage([])).toEqual([]);
    expect(parseBackupUsage(undefined)).toEqual([]);
  });

  it('should parse backup server entries', () => {
    expect(
      parseBackupUsage([
        { server: 'kc-dev3-mbox.demo.zextras.io' },
        { server: 'kc-dev3-mbox2.demo.zextras.io' },
      ]),
    ).toEqual([
      { server: 'kc-dev3-mbox.demo.zextras.io' },
      { server: 'kc-dev3-mbox2.demo.zextras.io' },
    ]);
  });

  it('should skip malformed backup entries', () => {
    expect(parseBackupUsage([{ server: '' }, { volume: 'ignored' }, null])).toEqual([]);
  });
});

describe('parseVolumeUsage', () => {
  it('should return empty array for unused values', () => {
    expect(parseVolumeUsage('unused')).toEqual([]);
    expect(parseVolumeUsage([])).toEqual([]);
    expect(parseVolumeUsage(undefined)).toEqual([]);
  });

  it('should parse volume entries with server and volume properties', () => {
    expect(
      parseVolumeUsage([
        { server: 'mbox.demo.zextras.io', volume: 'secondary' },
        { server: 'mbox2.demo.zextras.io', volume: 'other' },
      ]),
    ).toEqual([
      { server: 'mbox.demo.zextras.io', volume: 'secondary' },
      { server: 'mbox2.demo.zextras.io', volume: 'other' },
    ]);
  });

  it('should parse volume entries with dynamic key format', () => {
    expect(
      parseVolumeUsage([
        { 'server: kc-dev3-mbox.demo.zextras.io': 'volume: kcdev3secondary' },
        { 'server: kc-dev3-mbox.demo.zextras.io': 'volume: othervolume' },
      ]),
    ).toEqual([
      { server: 'kc-dev3-mbox.demo.zextras.io', volume: 'kcdev3secondary' },
      { server: 'kc-dev3-mbox.demo.zextras.io', volume: 'othervolume' },
    ]);
  });

  it('should skip malformed volume entries', () => {
    expect(parseVolumeUsage([{ server: 'host-only' }, { invalid: 'entry' }])).toEqual([]);
  });
});
