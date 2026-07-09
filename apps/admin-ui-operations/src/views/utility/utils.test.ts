/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { copyTextToClipboard, OperationsDoneHeader, OperationsHeader } from './utils';

const t = (((_key: string, fallback: string) => fallback) as unknown) as TFunction;

describe('OperationsHeader', () => {
	it('returns the running/queued table headers in order', () => {
		const headers = OperationsHeader(t);

		expect(headers).toHaveLength(5);
		expect(headers.map((h) => h.id)).toEqual([
			'Server',
			'Operation',
			'Secondary',
			'Index',
			'HSM Scheduling',
		]);
		expect(headers.every((h) => h.bold && h.i18nAllLabel === 'All')).toBe(true);
	});
});

describe('OperationsDoneHeader', () => {
	it('returns the done table headers in order', () => {
		const headers = OperationsDoneHeader(t);

		expect(headers).toHaveLength(6);
		expect(headers.map((h) => h.label)).toEqual([
			'Server',
			'Operation',
			'Status',
			'Author',
			'Submit date',
			'Start date',
		]);
	});
});

describe('copyTextToClipboard', () => {
	it('writes the given text to the clipboard', () => {
		const writeText = vi.fn();
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText },
			configurable: true,
		});

		copyTextToClipboard('copy me');

		expect(writeText).toHaveBeenCalledWith('copy me');
	});
});
