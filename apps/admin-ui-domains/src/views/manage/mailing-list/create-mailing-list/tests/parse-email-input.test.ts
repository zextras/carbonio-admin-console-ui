/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parseEmailInput } from '../parse-email-input';

describe('parse-email-input', () => {
	it('parses a single valid email', () => {
		expect(parseEmailInput('a@example.com')).toEqual({ type: 'ok', emails: ['a@example.com'] });
	});

	it('extracts valid emails from multi-email input and drops invalid fragments', () => {
		expect(parseEmailInput('a@example.com b@example.com, nope')).toEqual({
			type: 'ok',
			emails: ['a@example.com', 'b@example.com']
		});
	});

	it('reports a plain invalid input with the first offender', () => {
		expect(parseEmailInput('not-an-email')).toEqual({
			type: 'invalid',
			firstInvalid: 'not-an-email'
		});
	});
});
