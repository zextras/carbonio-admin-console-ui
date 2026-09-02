/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '../network/fetch';

export type BatchRequest = Record<string, unknown>;

export const batchService = async (
	reqObject: BatchRequest,
	otherAccount?: string
): Promise<Record<string, unknown>> => soapFetch('Batch', reqObject, { otherAccount });
