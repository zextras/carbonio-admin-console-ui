/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type GetServerVersionResponse =
	| { type: 'success'; version: string }
	| { type: 'error'; error: string };

export const getServerVersion = async (): Promise<GetServerVersionResponse> => {
	return fetch(`${BASE_PATH}.version`)
		.then((response) => {
			if (!response.ok) throw new Error(`Failed to fetch version: ${response.status}`);
			return response.text();
		})
		.then(
			(text) =>
				({ type: 'success', version: text.trim() }) satisfies GetServerVersionResponse,
		)
		.catch(
			(error) => ({ type: 'error', error: error.message }) satisfies GetServerVersionResponse,
		);
};
