/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from 'vitest';

import { assertNoFault } from '../assert-no-fault';

describe('assertNoFault', () => {
	it('should pass through envelopes without a Fault', () => {
		expect(() => assertNoFault({ Body: { response: {} } }, 'fallback')).not.toThrow();
		expect(() => assertNoFault({}, 'fallback')).not.toThrow();
	});

	it('should throw the Fault reason text when present', () => {
		expect(() =>
			assertNoFault({ Body: { Fault: { Reason: { Text: 'denied' } } } }, 'fallback'),
		).toThrow('denied');
	});

	it('should throw the fallback message when the Fault has no reason text', () => {
		expect(() => assertNoFault({ Body: { Fault: {} } }, 'fallback')).toThrow('fallback');
	});
});
