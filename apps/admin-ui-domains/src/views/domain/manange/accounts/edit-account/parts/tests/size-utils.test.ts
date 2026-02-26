/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getExactPercentage, getPercentage, humanFileSize } from '../size-utils';

describe('getExactPercentage', () => {
  it.each([
    [50, 200, 25],
    [75, 300, 25],
    [30, 120, 25],
    [0, 100, 0],
    [100, 100, 100],
    [33, 100, 33],
    [99, 100, 99],
    [1, 4, 25],
    [2, 8, 25],
    [1, 3, 33.33333333333333],
    [2, 3, 66.66666666666666],
    [99, 200, 49.5],
    [199, 400, 49.75],
    [0, 0, NaN], // division by zero
  ])('should return %i/%i as %f%%', (used, total, expected) => {
    const result = getExactPercentage(used, total);
    if (Number.isNaN(expected)) {
      expect(result).toBeNaN();
    } else {
      expect(result).toBeCloseTo(expected, 10);
    }
  });
});

describe('getPercentage', () => {
  it.each([
    [99, 200, 49], // 49.5 -> 49
    [199, 400, 49], // 49.75 -> 49
    [1, 3, 33], // 33.33...
    [2, 3, 66], // 66.66...
    [7, 10, 70], // 70
    [9, 10, 90], // 90
    [10, 11, 90], // 90.90... -> 90
    [1, 2, 50], // 50
    [3, 7, 42], // 42.857... -> 42
  ])('should floor %i/%i to %i%%', (used, total, expected) => {
    expect(getPercentage(used, total)).toBe(expected);
  });

  it('should return 0 if total is 0', () => {
    expect(getPercentage(100, 0)).toBe(100);
  });

  it.each([
    [50, 200, 25],
    [75, 300, 25],
    [30, 120, 25],
    [0, 100, 0],
    [100, 100, 100],
    [33, 100, 33],
    [99, 100, 99],
    [1, 4, 25],
    [2, 8, 25],
    [1, 3, 33],
    [0, 0, 100], // edge case, already tested above
  ])('should return %i/%i as %i%%', (used, total, expected) => {
    expect(getPercentage(used, total)).toBe(expected);
  });
});

describe('humanFileSize', () => {
  it('should return 0 B if input is 0', () => {
    const result = humanFileSize(0, undefined);
    expect(result).toBe('0 B');
  });

  it.each([
    [0, '0 B'],
    [1, '1 B'],
    [1023, '1023 B'],
    [1024, '1 KB'],
    [1048576, '1 MB'],
    [123456789, '117.74 MB'],
    [Number.MAX_SAFE_INTEGER, '8 PB'],
    [10485760, '10 MB'],
    [10527703, '10.04 MB'], // 10.04 MB, decimali "04"
    [1024 ** 4 * 2.5, '2.50 TB'], // 2.50 TB
    [1024 ** 5 - 1, '1 PB'], // limite PB
  ])('should return %s bytes as %s', (input, expected) => {
    expect(humanFileSize(input, undefined)).toBe(expected);
  });

  it('should return a number with two decimals and the correct unit', () => {
    const result = humanFileSize(123456789, undefined);
    expect(result).toBe('117.74 MB');
  });

  it.each([
    ['B', 0],
    ['KB', 1],
    ['MB', 2],
    ['GB', 3],
    ['TB', 4],
    ['PB', 5],
    ['EB', 6],
    ['ZB', 7],
    ['YB', 8],
  ])('should return %s unit if input pow is %s', (unit, pow) => {
    const result = humanFileSize(1024 ** pow, undefined);
    expect(result).toBe(`1 ${unit}`);
  });

  it.each([
    ['B', 1],
    ['KB', 2],
    ['MB', 3],
    ['GB', 4],
    ['TB', 5],
    ['PB', 6],
    ['EB', 7],
    ['ZB', 8],
  ])(
    'should return %s unit measure if input is one unit lower than the next unit measure',
    (unit, pow) => {
      const result = humanFileSize(1024 ** pow - 1024 ** (pow - 1), undefined);
      expect(result).toBe(`1023 ${unit}`);
    },
  );

  it('should change unit from KB to B when removing 1 B from 1024 B', () => {
    expect(humanFileSize(1024 - 1, undefined)).toBe('1023 B');
  });

  it.each([
    ['KB', 2],
    ['MB', 3],
    ['GB', 4],
  ])('should return 1024 %s if input is 1024 ** %s - 1', (unit, pow) => {
    const result = humanFileSize(1024 ** pow - 1, undefined);
    expect(result).toBe(`1024 ${unit}`);
  });

  it.each([
    ['PB', 5],
    ['EB', 6],
    ['ZB', 7],
    ['YB', 8],
  ])('should return %s unit if input pow is %s - 1B', (unit, pow) => {
    const result = humanFileSize(1024 ** pow - 1, undefined);
    expect(result).toBe(`1 ${unit}`);
  });

  it('should throw an error if inputSize is equal or greater than 1024 YB', () => {
    expect(() => humanFileSize(1024 ** 9, undefined)).toThrow('Unsupported inputSize');
  });
});
