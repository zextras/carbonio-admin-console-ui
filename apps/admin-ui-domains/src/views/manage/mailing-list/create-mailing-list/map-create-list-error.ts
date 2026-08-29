/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TranslateFn = (
	key: string,
	options?: { name?: string; defaultValue?: string }
) => string;

/**
 * Maps a failed `CreateDistributionList` error to a user-facing message:
 * known server faults ("no such domain", "email address already exists")
 * become localized messages, anything else passes through, and errors
 * without a message fall back to the generic retry message.
 */
export function mapCreateListError(error: unknown, listName: string, t: TranslateFn): string {
	const text =
		error instanceof Error ? error.message : (error as { message?: string } | undefined)?.message;
	if (text) {
		if (text.includes('no such domain')) {
			return t('label.specified_domain_not_exist', {
				defaultValue: 'Specified domain does not exist'
			});
		}
		if (text.includes('email address already exists')) {
			return t('label.email_addready_exists', {
				name: listName,
				defaultValue: 'Email address {{name}} already exists'
			});
		}
		return text;
	}
	return t('label.something_wrong_error_msg', {
		defaultValue: 'Something went wrong. Please try again.'
	});
}
