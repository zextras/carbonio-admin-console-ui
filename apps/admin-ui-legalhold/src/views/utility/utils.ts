/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type Details = {
	[key: string]: string;
};

type ErrorResponse = {
	code: string;
	details: Details;
	message: string;
	time: number;
};

export const formatedErrorMessage = (response: ErrorResponse): ErrorResponse => {
	if (response.details) {
		Object.entries(response.details).forEach(([key, value]) => {
			const placeholder = `{${key}}`;
			response.message = response.message.replace(placeholder, value);
		});
	}
	return response;
};
