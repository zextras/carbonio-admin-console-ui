/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type CreateSnackbarFnArgs } from '@zextras/ui-components';
import { TFunction } from 'i18next';

import { TOO_MANY_SEARCH_RESULTS_ERROR } from '../constants';

export function resolveErrorLabel(error: unknown, t: TFunction, fallback?: string): string {
	const message = typeof error === 'string' ? error : (error as Error | undefined)?.message;

	if (!message) {
		return (
			fallback ?? t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
		);
	}

	if (message.includes(TOO_MANY_SEARCH_RESULTS_ERROR)) {
		return t(
			'label.number_of_results_exceeded_the_limit',
			'The number of results exceeded the limit. Please use search to refine the results.'
		);
	}

	return message;
}

export const generateSnackbarFromError = (error: Error, t: TFunction): CreateSnackbarFnArgs => ({
	key: 'error',
	severity: 'error',
	label: resolveErrorLabel(error, t),
	autoHideTimeout: 3000,
	hideButton: true,
	replace: true
});
