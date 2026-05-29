/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { ZextrasRawResponse } from '../../types';

export const generateSignedCertificate = async (domain: string): Promise<ZextrasRawResponse> =>
	fetchExternalSoap(`/service/extension/zextras_admin/auth/saml-generate/${domain}`, {});
