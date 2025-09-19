/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from './src/history/hooks';
import {
	getSoapFetch,
	getSoapFetchRequest as getSoapFetchRequestFn,
	postSoapFetchRequest as postSoapFetchRequestFn,
	fetchExternalSoap as fetchExternalSoapFn
} from './src/network/fetch';
import { usePrimaryBarState } from './src/shell/hooks';
import { useUserAccount, useUserSettings } from './src/store/account/hooks';
import { useAllConfig } from './src/store/config';
import { useDomainInformation } from './src/store/domain-information';
import { getIntegratedFunction } from './src/store/integrations/getters';
import { getTags } from './src/store/tags';

const pkg = { name: 'admin-ui-console' };
export const soapFetch = getSoapFetch('admin-ui-console');
export const getSoapFetchRequest = getSoapFetchRequestFn(pkg.name);
export const postSoapFetchRequest = postSoapFetchRequestFn(pkg.name);
export const fetchExternalSoap = fetchExternalSoapFn(pkg.name);

export {
	useUserAccount,
	getIntegratedFunction,
	useUserSettings,
	getTags,
	replaceHistory,
	usePrimaryBarState,
	useAllConfig,
	useDomainInformation
};
