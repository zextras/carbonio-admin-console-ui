import { TFunction } from 'i18next';

import { TOO_MANY_SEARCH_RESULTS_ERROR } from '../../constants';

/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const generateSnackbarFromError = (
	error: Error,
	t: TFunction<'translation', undefined, 'translation'>
): any => {
	let errorText = '';

	if (error?.message) {
		if (error.message.includes(TOO_MANY_SEARCH_RESULTS_ERROR)) {
			errorText = t(
				'label.number_of_results_exceeded_the_limit',
				'The number of results exceeded the limit. Please use search to refine the results.'
			);
		} else {
			errorText = error.message;
		}
	} else {
		errorText = t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');
	}

	return {
		key: 'error',
		severity: 'error',
		label: errorText,
		autoHideTimeout: 3000,
		hideButton: true,
		replace: true
	};
};
