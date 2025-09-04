/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType, FC } from 'react';
import { type TFunction } from 'react-i18next';
import { type LinkProps } from 'react-router-dom';
import { type Reducer, type Store } from 'redux';

import {
	AccountSettings,
	Account,
	AccountRights,
	AccountRightName,
	AccountRightTarget,
	SoapFetch,
	SoapFetchPost,
	SoapFetchExternal,
	SoapFetchRequest
} from '../account';
import {
	AppRoute,
	AppRouteDescriptor,
	BadgeInfo,
	BoardView,
	CarbonioModule,
	PrimaryAccessoryView,
	SearchView,
	SecondaryAccessoryView,
	UtilityView
} from '../apps';
import { ActionFactory, AnyFunction, CombinedActionFactory, Action } from '../integrations';
import { HistoryParams, ShellModes } from '../misc';
import {
	Mods,
	TagActionResponse,
	CreateTagResponse,
	SoapNotify,
	SoapRefresh,
	Attribute
} from '../network';
import { Tag, Tags } from '../tags';

declare const getBridgedFunctions: () => {
	addBoard: (path: string, context?: unknown | { app: string }) => void;
	createModal: (...params: any[]) => void;
	createSnackbar: (...params: any[]) => void;
	getHistory: () => History;
	removeBoard: (key: string) => void;
	removeCurrentBoard: () => void;
	setCurrentBoard: (key: string) => void;
	updateBoard: (key: string, url: string, title: string) => void;
	updateCurrentBoard: (url: string, title: string) => void;
	t: TFunction;
	toggleMinimizedBoard: () => void;
};
declare const editSettings: (mods: Mods) => Promise<any>;
declare const ZIMBRA_STANDARD_COLORS: Array<{ zValue: number; hex: string; zLabel: string }>;
declare const FOLDERS: {
	[name: string]: string;
};
export const SHELL_APP_ID = 'carbonio-admin-ui';
export const SEARCH_APP_ID = 'search';
declare const ACTION_TYPES: {
	[name: string]: string;
};
declare const SHELL_MODES: Record<string, ShellModes>;
declare const BASENAME: string;

declare const getIntegratedHook: (id: string) => [Function, boolean];

declare const getIntegratedFunction: (id: string) => [Function, boolean];
declare const getIntegratedComponent: (id: string) => [ComponentType<unknown>, boolean];
declare const getActions: <T>(target: T, type: string) => Array<Action>;
declare const getActionsFactory: (type: string) => <T>(target: T) => Array<Action>;
declare const getAction: <T>(type: string, id: string, target?: T) => [Action | undefined, boolean];
declare const getActionFactory: <T>(
	type: string,
	id: string
) => [ActionFactory<T> | undefined, boolean];

declare const useIntegratedHook: (id: string) => [Function, boolean];

declare const useIntegratedFunction: (id: string) => [Function, boolean];
declare const useIntegratedComponent: (id: string) => [ComponentType<unknown>, boolean];
declare const useActions: <T>(target: T, type: string) => Array<Action>;
declare const useActionsFactory: <T>(type: string) => CombinedActionFactory<T>;
declare const useAction: <T>(type: string, id: string, target?: T) => [Action | undefined, boolean];
declare const useActionFactory: <T>(
	type: string,
	id: string
) => [ActionFactory<T> | undefined, boolean];
declare const useApp: () => CarbonioModule;
declare const getApp: () => CarbonioModule;
declare const useAppContext: <T>() => T;
declare const getAppContext: <T>() => T;
declare const useUserAccount: () => Account;
declare const useUserAccounts: () => Array<Account>;
declare const useUserRights: () => AccountRights;
declare const useUserRight: (right: AccountRightName) => Array<AccountRightTarget>;
declare const getUserAccount: () => Account;
declare const getUserAccounts: () => Array<Account>;
declare const getUserRights: () => AccountRights;
declare const getUserRight: (right: AccountRightName) => Array<AccountRightTarget>;
declare const useTags: () => Tags;
declare const getTags: () => Tags;
declare const useTag: (id: string) => Tag;
declare const getTag: (id: string) => Tag;
declare const createTag: (tag: Omit<Tag, 'id'>) => Promise<CreateTagResponse>;
declare const renameTag: (id: string, name: string) => Promise<TagActionResponse>;
declare const deleteTag: (id: string) => Promise<TagActionResponse>;
declare const changeTagColor: (id: string, color: number | string) => Promise<TagActionResponse>;
declare const useUserSettings: () => AccountSettings;
declare const useUserSetting: <T = void>(...path: Array<string>) => string | T;
declare const getUserSettings: () => AccountSettings;
declare const getUserSetting: <T = void>(...path: Array<string>) => string | T;
declare const store: {
	store: Store<any>;
	setReducer(nextReducer: Reducer): void;
};
declare const Applink: FC<LinkProps>;
declare const useAddBoardCallback: () => (
	path: string,
	context?: { app?: string; title?: string }
) => void;
declare const useUpdateCurrentBoard: () => (url: string, title: string) => void;
declare const useRemoveCurrentBoard: () => () => void;
declare const useBoardConfig: <T>() => T;

declare const useIsMobile: () => boolean;
declare const soapFetch: SoapFetch;
declare const getSoapFetchRequest: SoapFetchRequest;
declare const postSoapFetchRequest: SoapFetchPost;
declare const fetchExternalSoap: SoapFetchExternal;
declare const xmlSoapFetch: SoapFetch;
declare const report: (error: Error, hint?: unknown) => void;
declare const setAppContext: <T>(obj: T) => void;

declare const removeActions: (...ids: Array<string>) => void;
declare const registerActions: (
	...items: Array<{ id: string; action: ActionFactory<unknown>; type: string }>
) => void;
declare const removeComponents: (...ids: Array<string>) => void;
declare const registerComponents: (
	...items: Array<{ id: string; component: ComponentType }>
) => void;
declare const removeHooks: (...ids: Array<string>) => void;
declare const registerHooks: (...items: Array<{ id: string; hook: AnyFunction }>) => void;
declare const removeFunctions: (...ids: Array<string>) => void;
declare const registerFunctions: (...items: Array<{ id: string; fn: AnyFunction }>) => void;
// add route (id route primaryBar secondaryBar app)
declare const addRoute: (routeData: Partial<AppRouteDescriptor>) => string;
declare const setRouteVisibility: (id: string, visible: boolean) => void;
// remove route (id | route)
declare const removeRoute: (id: string) => void;
//
// update primaryBar
declare const updatePrimaryBadge: (badge: Partial<BadgeInfo>, id: string) => void;
declare const updateUtilityBadge: (badge: Partial<BadgeInfo>, id: string) => void;
//
// add board
declare const addBoardView: (data: object & Partial<BoardView>) => string;
// remove board
declare const removeBoardView: (id: string) => void;
//
// add search
declare const addSearchView: (data: Partial<SearchView>) => string;
// remove search
declare const removeSearchView: (id: string) => void;
//
// add utility
declare const addUtilityView: (data: Partial<UtilityView>) => string;
// remove utility
declare const removeUtilityView: (id: string) => void;
//
// add primaryAccessory
declare const addPrimaryAccessoryView: (data: Partial<PrimaryAccessoryView>) => string;
// remove primaryAccessory
declare const removePrimaryAccessoryView: (id: string) => void;
//
// add secondaryAccessory
declare const addSecondaryAccessoryView: (data: Partial<SecondaryAccessoryView>) => string;
// remove secondaryAccessory
declare const removeSecondaryAccessoryView: (id: string) => void;
declare const pushHistory: (params: HistoryParams) => void;
declare const replaceHistory: (params: HistoryParams) => void;
declare const goBackHistory: () => void;
declare const useCurrentRoute: () => AppRoute | undefined;
declare const getCurrentRoute: () => AppRoute | undefined;
declare const usePrimaryBarState: () => boolean;
declare const useNetworkState: () => any;
declare const useAllConfig: () => Array<Attribute>;
declare const useIsAdvanced: () => boolean;
declare const getIsAdvanced: () => boolean;
declare const useDomainInformation: () => any;
