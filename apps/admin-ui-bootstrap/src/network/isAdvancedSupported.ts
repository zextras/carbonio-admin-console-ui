/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isArray } from 'lodash-es';

type Supported = {
	supported: boolean;
};
type Error = {
	errorMessage: string;
};
export const isAdvancedSupported = (): Promise<Supported | Error> =>
	fetch('/services/catalog/services')
		.then(async (response: Response) => {
			if (response.ok) {
				const data = await response.json();
				if ('items' in data && isArray<string>(data.items)) {
					const installedServices = data.items as Array<string>;
					const isAdvanced =
						installedServices.filter((service): boolean => service === 'carbonio-advanced').length >
						0;
					return { supported: isAdvanced };
				}
			}
			return { errorMessage: '' };
		})
		.catch(() => ({ errorMessage: 'Network error' }));
