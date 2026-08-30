/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import { GET, GET_GLOBAL_CONFIG, SET, SET_GLOBAL_CONFIG, ZX_CONFIG } from '../constants';

export type MobileAntiDosAttribute =
	| 'mobileAntiDosServiceEnabled'
	| 'mobileAntiDosServiceJailDuration'
	| 'mobileAntiDosServiceMaxRequests'
	| 'mobileAntiDosServiceTimeWindow';

export const getMobileAntiDosService = async (
	attribute: MobileAntiDosAttribute
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_CONFIG,
			action: GET_GLOBAL_CONFIG,
			command: GET,
			attribute
		},
		'zextras'
	);

export const setMobileAntiDosService = async (
	attribute: MobileAntiDosAttribute,
	value: number | boolean
): Promise<any> =>
	postSoapFetchRequest(
		`/service/admin/soap`,
		{
			_jsns: 'urn:zimbraAdmin',
			module: ZX_CONFIG,
			action: SET_GLOBAL_CONFIG,
			command: SET,
			attribute,
			value
		},
		'zextras'
	);
