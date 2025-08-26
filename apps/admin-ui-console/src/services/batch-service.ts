/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const batchService = async (reqObject: any, otherAccount?: any): Promise<any> =>
	soapFetch('Batch', reqObject, otherAccount);
