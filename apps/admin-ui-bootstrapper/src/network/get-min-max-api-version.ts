/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAdvanceStore } from '../store/advance';

export const getMinMaxAPIVersion = (): Promise<void> =>
	fetch('/zx/auth/supported')
		// eslint-disable-next-line consistent-return
		.then(async (response: any) => {
			const data = await response.json();
			if (data?.domain) {
				useAdvanceStore.setState({
					maxApiVersion: data?.maxApiVersion,
					minApiVersion: data?.minApiVersion,
					version: data?.version,
					domain: data?.domain
				});
				return;
			}
			throw new Error('');
		});
