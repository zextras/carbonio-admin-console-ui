/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const modifyConfig = async (
	a: Array<Record<string, string>>,
): Promise<Record<string, unknown>> =>
	soapFetch(`ModifyConfig`, {
		_jsns: 'urn:zimbraAdmin',
		a,
	});
