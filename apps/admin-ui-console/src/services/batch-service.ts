/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

 
export const batchService = async (reqObject: any, otherAccount?: any): Promise<any> =>
	soapFetch('Batch', reqObject, {otherAccount});
