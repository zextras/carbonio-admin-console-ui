/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/admin-ui-bootstrapper';

export const getAllServers = async (): Promise<any> =>
	soapFetch(`GetAllServers`, {
		// eslint-disable-next-line sonarjs/no-duplicate-string
		_jsns: 'urn:zimbraAdmin',
		attrs: 'description,zimbraServiceHostname,zimbraId'
	});

export const getMailstoresServers = async (): Promise<any> =>
	soapFetch(`GetAllServers`, {
		_jsns: 'urn:zimbraAdmin',
		attrs: 'description,zimbraServiceHostname,zimbraId',
		service: 'mailbox'
	});
export const getAllServerByService = async (serviceName: string): Promise<any> =>
	soapFetch(`GetAllServers`, {
		_jsns: 'urn:zimbraAdmin',
		service: serviceName
	});
