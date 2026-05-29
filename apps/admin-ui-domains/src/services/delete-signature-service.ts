/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { SoapEmptyResponse } from '../../types';

export const deleteSignature = async (id: string, signatureId: string): Promise<SoapEmptyResponse> =>
	postSoapFetchRequest(
		`/service/admin/soap/DeleteSignatureRequest`,
		{
			_jsns: 'urn:zimbraAccount',
			signature: {
				id: signatureId
			}
		},
		'DeleteSignatureRequest',
		id
	);
