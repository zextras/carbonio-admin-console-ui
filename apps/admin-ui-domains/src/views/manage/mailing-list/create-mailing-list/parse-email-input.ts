/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getAllEmailFromString, isValidEmail } from '../../../utility/utils';

const SPECIAL_CHARS = /[ `'"<>,;]/;

export type EmailInputParse =
	| { type: 'ok'; emails: Array<string> }
	| { type: 'invalid'; firstInvalid: string }
	| { type: 'undefined' };

/**
 * Parses free-text (possibly multi-email) input for the wizard sections.
 * Mirrors the original inline validation: unparseable multi-input →
 * `undefined`; any invalid address → `invalid` with the first offender.
 * Duplicates of already-present entries are NOT rejected here (the callers
 * `uniq` them away, as the original did).
 */
export function parseEmailInput(input: string): EmailInputParse {
	const allEmails: Array<string> | null | undefined = SPECIAL_CHARS.test(input)
		? getAllEmailFromString(input)
		: [input];

	if (allEmails === undefined || allEmails === null) {
		return { type: 'undefined' };
	}

	const invalidEmailAddress = allEmails.filter((item) => !isValidEmail(item));
	if (invalidEmailAddress.length > 0) {
		return { type: 'invalid', firstInvalid: invalidEmailAddress[0] };
	}

	return { type: 'ok', emails: allEmails };
}
