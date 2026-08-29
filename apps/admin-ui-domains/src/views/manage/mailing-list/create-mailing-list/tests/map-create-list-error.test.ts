/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import { mapCreateListError } from '../map-create-list-error';

const t = (key: string, options?: { name?: string; defaultValue?: string }): string => {
	const template = options?.defaultValue ?? key;
	return template.replace('{{name}}', options?.name ?? '');
};

describe('mapCreateListError', () => {
	it('maps a missing domain fault to a localized message', () => {
		expect(
			mapCreateListError(new Error('no such domain: example.com'), 'announce@example.com', t)
		).toBe('Specified domain does not exist');
	});

	it('maps an existing address fault to a localized message with the list name', () => {
		expect(
			mapCreateListError(
				new Error('email address already exists: announce@example.com'),
				'announce@example.com',
				t
			)
		).toBe('Email address announce@example.com already exists');
	});

	it('passes through any other error message', () => {
		expect(mapCreateListError(new Error('boom'), 'announce@example.com', t)).toBe('boom');
	});

	it('falls back to a generic message when the error has no message', () => {
		expect(mapCreateListError({}, 'announce@example.com', t)).toBe(
			'Something went wrong. Please try again.'
		);
		expect(mapCreateListError(undefined, 'announce@example.com', t)).toBe(
			'Something went wrong. Please try again.'
		);
	});
});
