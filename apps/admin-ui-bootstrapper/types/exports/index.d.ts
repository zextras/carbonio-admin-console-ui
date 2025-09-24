/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType } from 'react';

import { UseUserAccount } from '../../src/store/account/hooks';
import {
	AccountSettings,
	Account,
	SoapFetch,
	SoapFetchPost,
	SoapFetchExternal,
	SoapFetchRequest
} from '../account';
import { AppRouteDescriptor } from '../apps';
import { ActionFactory } from '../integrations';
import { HistoryParams } from '../misc';
import { Attribute } from '../network';
import { Tags } from '../tags';

export const SHELL_APP_ID = 'carbonio-admin-ui';
export const SEARCH_APP_ID = 'search';
declare const ACTION_TYPES: {
	[name: string]: string;
};
declare const BASENAME: string;

declare const getIntegratedFunction: (id: string) => [Function, boolean];
declare const useIntegratedComponent: (id: string) => [ComponentType<unknown>, boolean];
declare const useUserAccount: () => UseUserAccount;
declare const useUserAccounts: () => Array<Account>;
declare const getTags: () => Tags;
declare const useUserSettings: () => AccountSettings;
declare const soapFetch: SoapFetch;
declare const getSoapFetchRequest: SoapFetchRequest;
declare const postSoapFetchRequest: SoapFetchPost;
declare const fetchExternalSoap: SoapFetchExternal;
declare const setAppContext: <T>(obj: T) => void;
declare const registerActions: (
	...items: Array<{ id: string; action: ActionFactory<unknown>; type: string }>
) => void;
declare const addRoute: (routeData: Partial<AppRouteDescriptor>) => string;
declare const removeRoute: (id: string) => void;
declare const pushHistory: (params: HistoryParams) => void;
declare const replaceHistory: (params: HistoryParams) => void;
declare const usePrimaryBarState: () => boolean;
declare const useAllConfig: () => Array<Attribute>;
declare const useIsAdvanced: () => boolean;
declare const useDomainInformation: () => any;
