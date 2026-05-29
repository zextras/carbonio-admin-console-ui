/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/ui-shared';

import type { BatchRequest, BatchResponse } from '../../types';

export const batchService = async (reqObject: BatchRequest, otherAccount?: string): Promise<BatchResponse> =>
	soapFetch<BatchRequest, BatchResponse>('Batch', reqObject, { otherAccount });
