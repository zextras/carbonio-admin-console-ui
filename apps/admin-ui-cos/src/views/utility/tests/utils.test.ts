/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, test, expect } from 'vitest';

import { bytesToHumanReadable } from '../utils';

function bytesToMB(bytes: number): number {
	return parseFloat((bytes / 1024 / 1024).toFixed(2));
}

function mbToBytes(mb: number): number {
	return mb * 1024 * 1024;
}

describe('bytesToHumanReadable', () => {
	test('Zero bytes', () => {
		expect(bytesToHumanReadable(0)).toBe('0 Bytes');
	});

	test('Bytes under 1 KB', () => {
		expect(bytesToHumanReadable(500)).toBe('500 Bytes');
		expect(bytesToHumanReadable(1023)).toBe('1023 Bytes');
	});

	test('Kilobytes', () => {
		expect(bytesToHumanReadable(1024)).toBe('1 KB');
		expect(bytesToHumanReadable(1536)).toBe('1.5 KB');
		expect(bytesToHumanReadable(1048575)).toBe('1024 KB');
	});

	test('Megabytes', () => {
		expect(bytesToHumanReadable(1048576)).toBe('1 MB');
		expect(bytesToHumanReadable(1572864)).toBe('1.5 MB');
		expect(bytesToHumanReadable(1073741823)).toBe('1024 MB');
	});

	test('Gigabytes', () => {
		expect(bytesToHumanReadable(1073741824)).toBe('1 GB');
		expect(bytesToHumanReadable(1610612736)).toBe('1.5 GB');
		expect(bytesToHumanReadable(1099511627775)).toBe('1024 GB');
	});

	test('Terabytes', () => {
		expect(bytesToHumanReadable(1099511627776)).toBe('1 TB');
		expect(bytesToHumanReadable(1649267441664)).toBe('1.5 TB');
		expect(bytesToHumanReadable(1125899906842500)).toBe('1024 TB');
	});

	test('Petabytes', () => {
		expect(bytesToHumanReadable(1125899906842624)).toBe('1 PB');
		expect(bytesToHumanReadable(1688849860263936)).toBe('1.5 PB');
	});

	test('Extremely large numbers', () => {
		expect(bytesToHumanReadable(1e24)).toBe('847.03 ZB');
	});

	test('should give 1 mb of 1048576 bytes', () => {
		expect(bytesToMB(1048576)).toBe(1);
	});

	test('should give 0 if pass 0', () => {
		expect(bytesToMB(0)).toBe(0);
	});

	test('should give 2097152 bytes if pass 2 mb', () => {
		expect(mbToBytes(2)).toBe(2097152);
	});

	test('should give 0 bytes if pass 0 mb', () => {
		expect(mbToBytes(0)).toBe(0);
	});
});
