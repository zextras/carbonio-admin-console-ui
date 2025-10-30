/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export async function retry<T>(
	fn: () => Promise<T>,
	options: {
		retries?: number;
		delay?: number;
		backoff?: number;
	} = {}
): Promise<T> {
	const { retries = 3, delay = 1000, backoff = 2 } = options;

	try {
		return await fn();
	} catch (error) {
		if (retries > 0) {
			await new Promise((resolve) => {
				setTimeout(resolve, delay);
			});
			return retry(fn, {
				retries: retries - 1,
				delay: delay * backoff,
				backoff
			});
		}
		throw error;
	}
}
