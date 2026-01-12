/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import 'jest-styled-components';

declare module 'jest-styled-components' {
	export interface Matchers<R> {
		toHaveStyleRule(property: string, value?: string | RegExp, options?: { target?: string }): R;
	}
}
