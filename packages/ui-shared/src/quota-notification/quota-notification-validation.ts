/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	QUOTA_NOTIFICATION_BODY_MAX_LENGTH,
	QUOTA_NOTIFICATION_COUNTER_THRESHOLD,
	QUOTA_NOTIFICATION_PLACEHOLDERS,
	QUOTA_NOTIFICATION_SUBJECT_MAX_LENGTH,
} from './constants';
import type { QuotaNotificationErrorCode } from './types';

export type QuotaNotificationField = 'subject' | 'body';

export type QuotaNotificationValidationError = {
	code: QuotaNotificationErrorCode;
	detail?: string;
};

export type QuotaNotificationCounter = {
	count: number;
	max: number;
	/** The counter is displayed from 90% of the limit. */
	isVisible: boolean;
	isAtLimit: boolean;
};

const PLACEHOLDER_REGEX = /\{\{([^{}]*)\}\}/g;

const CODE_POINT_TAB = 0x09;
const CODE_POINT_LF = 0x0a;

export const QUOTA_NOTIFICATION_FIELD_MAX_LENGTH: Record<QuotaNotificationField, number> = {
	subject: QUOTA_NOTIFICATION_SUBJECT_MAX_LENGTH,
	body: QUOTA_NOTIFICATION_BODY_MAX_LENGTH,
};

/** NFC, never NFKC: this is the normalization applied by the backend before validating. */
export function normalizeNfc(value: string): string {
	return value.normalize('NFC');
}

/** Length in code points after NFC, the unit of the limits (not UTF-16 units, not bytes). */
export function countCodePoints(value: string): number {
	return [...normalizeNfc(value)].length;
}

/** Cuts the text to `max` code points (after NFC). Returns the value untouched if it fits. */
export function truncateToCodePoints(value: string, max: number): string {
	if (countCodePoints(value) <= max) {
		return value;
	}
	return [...normalizeNfc(value)].slice(0, max).join('');
}

/** CRLF and lone CR become LF, as the backend does before validating the body. */
export function normalizeLineBreaks(value: string): string {
	return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
}

function isForbiddenCodePoint(codePoint: number, allowWhitespace: boolean): boolean {
	if (allowWhitespace && (codePoint === CODE_POINT_TAB || codePoint === CODE_POINT_LF)) {
		return false;
	}
	return (
		codePoint <= 0x1f || // C0 controls
		(codePoint >= 0x7f && codePoint <= 0x9f) || // DEL and C1 controls
		codePoint === 0x2028 ||
		codePoint === 0x2029 ||
		(codePoint >= 0x202a && codePoint <= 0x202e) || // bidi overrides
		(codePoint >= 0x2066 && codePoint <= 0x2069) || // bidi isolates
		codePoint === 0x200b ||
		codePoint === 0x2060 ||
		codePoint === 0xfeff ||
		(codePoint >= 0xd800 && codePoint <= 0xdfff) // lone surrogates
	);
}

function formatCodePoint(codePoint: number): string {
	return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

function findForbiddenCharacter(value: string, allowWhitespace: boolean): string | undefined {
	for (const char of value) {
		const codePoint = char.codePointAt(0) ?? 0;
		if (isForbiddenCodePoint(codePoint, allowWhitespace)) {
			return formatCodePoint(codePoint);
		}
	}
	return undefined;
}

/** First `{{…}}` pair that is not a known placeholder (case-sensitive, no inner spaces). */
export function findUnknownPlaceholder(value: string): string | undefined {
	const known = new Set<string>(QUOTA_NOTIFICATION_PLACEHOLDERS);
	for (const match of value.matchAll(PLACEHOLDER_REGEX)) {
		if (!known.has(match[1])) {
			return match[0];
		}
	}
	return undefined;
}

function validateText(
	field: QuotaNotificationField,
	value: string,
): QuotaNotificationValidationError | null {
	const isBody = field === 'body';
	const text = isBody ? normalizeLineBreaks(value) : value;

	if (normalizeNfc(text).trim() === '') {
		return { code: 'REQUIRED' };
	}
	if (countCodePoints(text) > QUOTA_NOTIFICATION_FIELD_MAX_LENGTH[field]) {
		return { code: 'TOO_LONG' };
	}
	const forbidden = findForbiddenCharacter(text, isBody);
	if (forbidden) {
		return { code: 'FORBIDDEN_CHARACTER', detail: forbidden };
	}
	const unknownPlaceholder = findUnknownPlaceholder(text);
	if (unknownPlaceholder) {
		return { code: 'UNKNOWN_PLACEHOLDER', detail: unknownPlaceholder };
	}
	return null;
}

export function validateSubject(value: string): QuotaNotificationValidationError | null {
	return validateText('subject', value);
}

export function validateBody(value: string): QuotaNotificationValidationError | null {
	return validateText('body', value);
}

export function getQuotaNotificationCounter(
	value: string,
	max: number,
): QuotaNotificationCounter {
	const count = countCodePoints(value);
	return {
		count,
		max,
		isVisible: count >= Math.ceil(max * QUOTA_NOTIFICATION_COUNTER_THRESHOLD),
		isAtLimit: count >= max,
	};
}
