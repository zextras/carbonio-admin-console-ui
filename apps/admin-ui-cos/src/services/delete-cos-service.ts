/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

export const deleteCOS = async (cosId: string): Promise<Record<string, never>> =>
	soapFetch(`DeleteCos`, {
		_jsns: 'urn:zimbraAdmin',
		id: { _content: cosId }
	});
