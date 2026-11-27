/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
	countCodePoints,
	findUnknownPlaceholder,
	getQuotaNotificationCounter,
	normalizeLineBreaks,
	truncateToCodePoints,
	validateBody,
	validateSubject,
} from '../quota-notification-validation';

describe('countCodePoints', () => {
	it('counts code points, not UTF-16 units', () => {
		expect('😀'.length).toBe(2);
		expect(countCodePoints('😀')).toBe(1);
		expect(countCodePoints('ab😀')).toBe(3);
	});

	it('counts CJK and Cyrillic characters once each', () => {
		expect(countCodePoints('你好世界')).toBe(4);
		expect(countCodePoints('Привет')).toBe(6);
	});

	it('counts after NFC normalization', () => {
		const decomposed = 'é';
		expect(decomposed.length).toBe(2);
		expect(countCodePoints(decomposed)).toBe(1);
	});
});

describe('truncateToCodePoints', () => {
	it('returns the same text when it fits', () => {
		expect(truncateToCodePoints('abc', 3)).toBe('abc');
	});

	it('cuts on code point boundaries without splitting surrogate pairs', () => {
		expect(truncateToCodePoints('a😀b😀', 3)).toBe('a😀b');
	});
});

describe('normalizeLineBreaks', () => {
	it('converts CRLF and lone CR to LF', () => {
		expect(normalizeLineBreaks('a\r\nb\rc\nd')).toBe('a\nb\nc\nd');
	});
});

describe('findUnknownPlaceholder', () => {
	it('accepts the four known placeholders, also repeated', () => {
		expect(
			findUnknownPlaceholder('{{usedQuota}} {{quotaLimit}} {{displayName}} {{email}} {{email}}'),
		).toBeUndefined();
	});

	it.each(['{{ displayName }}', '{{DisplayName}}', '{{foo}}', '{{}}'])(
		'rejects %s',
		(value) => {
			expect(findUnknownPlaceholder(`Hi ${value}`)).toBe(value);
		},
	);

	it('keeps a lone {{ or }} as text', () => {
		expect(findUnknownPlaceholder('open {{ here')).toBeUndefined();
		expect(findUnknownPlaceholder('close }} there')).toBeUndefined();
		expect(findUnknownPlaceholder('a { b } c')).toBeUndefined();
	});
});

describe('validateSubject', () => {
	it('requires a non-empty value after trim', () => {
		expect(validateSubject('')).toEqual({ code: 'REQUIRED' });
		expect(validateSubject('   ')).toEqual({ code: 'REQUIRED' });
	});

	it('accepts exactly 150 characters and rejects 151', () => {
		expect(validateSubject('a'.repeat(150))).toBeNull();
		expect(validateSubject('a'.repeat(151))).toEqual({ code: 'TOO_LONG' });
	});

	it('counts emoji as one character against the limit', () => {
		expect(validateSubject('😀'.repeat(150))).toBeNull();
		expect(validateSubject('😀'.repeat(151))).toEqual({ code: 'TOO_LONG' });
	});

	it.each([
		['\n', 'U+000A'],
		['\t', 'U+0009'],
		['\r', 'U+000D'],
		['\u007f', 'U+007F'],
		['\u0085', 'U+0085'],
		[' ', 'U+2028'],
		['‮', 'U+202E'],
		['⁦', 'U+2066'],
		['​', 'U+200B'],
		['﻿', 'U+FEFF'],
		['\ud800', 'U+D800'],
	])('rejects the forbidden character %j', (char, detail) => {
		expect(validateSubject(`a${char}b`)).toEqual({ code: 'FORBIDDEN_CHARACTER', detail });
	});

	it('allows ZWJ and ZWNJ, needed for emoji and Indic scripts', () => {
		expect(validateSubject('👨‍👩‍👧 a‌b')).toBeNull();
	});

	it('rejects unknown placeholders', () => {
		expect(validateSubject('Hi {{dispalyName}}')).toEqual({
			code: 'UNKNOWN_PLACEHOLDER',
			detail: '{{dispalyName}}',
		});
	});
});

describe('validateBody', () => {
	it('requires a non-empty value after trim', () => {
		expect(validateBody(' \n ')).toEqual({ code: 'REQUIRED' });
	});

	it('accepts exactly 2000 characters and rejects 2001', () => {
		expect(validateBody('a'.repeat(2000))).toBeNull();
		expect(validateBody('a'.repeat(2001))).toEqual({ code: 'TOO_LONG' });
	});

	it('allows LF and TAB and converts CRLF before validating', () => {
		expect(validateBody('line 1\n\tline 2\r\nline 3\rline 4')).toBeNull();
	});

	it('still rejects other control characters', () => {
		expect(validateBody('a\u0000b')).toEqual({ code: 'FORBIDDEN_CHARACTER', detail: 'U+0000' });
		expect(validateBody('a b')).toEqual({ code: 'FORBIDDEN_CHARACTER', detail: 'U+2029' });
	});

	it('rejects unknown placeholders', () => {
		expect(validateBody('Hello {{foo}}')).toEqual({
			code: 'UNKNOWN_PLACEHOLDER',
			detail: '{{foo}}',
		});
	});
});

describe('getQuotaNotificationCounter', () => {
	it('is hidden below 90% of the limit', () => {
		expect(getQuotaNotificationCounter('a'.repeat(134), 150)).toMatchObject({
			count: 134,
			isVisible: false,
			isAtLimit: false,
		});
	});

	it('is visible from 90% of the limit', () => {
		expect(getQuotaNotificationCounter('a'.repeat(135), 150)).toMatchObject({
			isVisible: true,
			isAtLimit: false,
		});
		expect(getQuotaNotificationCounter('a'.repeat(1800), 2000).isVisible).toBe(true);
	});

	it('flags the limit', () => {
		expect(getQuotaNotificationCounter('a'.repeat(150), 150).isAtLimit).toBe(true);
	});
});
