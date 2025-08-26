/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// The 'useXXX' functions actually return hooks
/* eslint-disable react-hooks/rules-of-hooks */

import { reduce } from 'lodash';

import { CarbonioModule } from '../../../types';
import {
	usePushHistoryCallback,
	useGoBackHistoryCallback,
	useReplaceHistoryCallback,
	getCurrentRoute,
	useCurrentRoute,
	replaceHistory,
	goBackHistory,
	pushHistory
} from '../../history/hooks';
import {
	getSoapFetch,
	getSoapFetchRequest,
	getXmlSoapFetch,
	postSoapFetchRequest,
	fetchExternalSoap
} from '../../network/fetch';
import { changeTagColor, createTag, deleteTag, renameTag, updateTag } from '../../network/tags';
import {
	getUseAddBoardCallback,
	useBoardConfig,
	useRemoveCurrentBoard,
	useUpdateCurrentBoard
} from '../../shell/boards/board-hooks';
import { useIsMobile, usePrimaryBarState, useNetworkState } from '../../shell/hooks';
import {
	getUserAccount,
	getUserAccounts,
	getUserSettings,
	useUserAccount,
	useUserAccounts,
	useUserSettings,
	useUserRight,
	useUserRights,
	getUserRight,
	getUserRights
} from '../../store/account';
import { getIsAdvanced, useIsAdvanced } from '../../store/advance';
import { getApp, getAppContext, useApp, useAppContext } from '../../store/app';
import { useAllConfig } from '../../store/config';
import { useContextBridge } from '../../store/context-bridge';
import { useDomainInformation } from '../../store/domain-information';
import {
	getAction,
	getActions,
	getActionsFactory,
	getActionFactory,
	getIntegratedComponent,
	getIntegratedFunction,
	getIntegratedHook
} from '../../store/integrations/getters';
import {
	useAction,
	useActions,
	useActionsFactory,
	useActionFactory,
	useIntegratedComponent,
	useIntegratedFunction,
	useIntegratedHook
} from '../../store/integrations/hooks';
import { useNotify, useRefresh } from '../../store/network';
import { getTag, getTags, useTag, useTags } from '../../store/tags';

// eslint-disable-next-line @typescript-eslint/ban-types
export const getAppFunctions = (pkg: CarbonioModule): Record<string, Function> => ({
	soapFetch: getSoapFetch(pkg.name),
	getSoapFetchRequest: getSoapFetchRequest(pkg.name),
	postSoapFetchRequest: postSoapFetchRequest(pkg.name),
	fetchExternalSoap: fetchExternalSoap(pkg.name),
	xmlSoapFetch: getXmlSoapFetch(pkg.name),

	// APP STORE FUNCTIONS
	useAppContext: useAppContext(pkg.name),
	getAppContext: getAppContext(pkg.name),
	useApp: useApp(pkg.name),
	getApp: getApp(pkg.name),

	// INTEGRATIONS
	useIntegratedHook,
	getIntegratedHook,
	useIntegratedFunction,
	getIntegratedFunction,
	useIntegratedComponent,
	getIntegratedComponent,
	useAction,
	getAction,
	useActions,
	getActions,
	useActionsFactory,
	getActionsFactory,
	useActionFactory,
	getActionFactory,
	// ACCOUNTS
	useUserAccount,
	getUserAccount,
	useUserAccounts,
	getUserAccounts,
	useUserSettings,
	getUserSettings,
	useUserRight,
	useUserRights,
	getUserRight,
	getUserRights,
	useTags,
	getTags,
	useTag,
	getTag,
	useNotify,
	useRefresh,
	// BOARDS
	useAddBoardCallback: getUseAddBoardCallback(pkg.name),
	useUpdateCurrentBoard,
	useRemoveCurrentBoard,
	useBoardConfig,
	// HISTORY
	usePushHistoryCallback,
	useGoBackHistoryCallback,
	useReplaceHistoryCallback,
	useCurrentRoute,
	getCurrentRoute,
	pushHistory,
	goBackHistory,
	replaceHistory,
	// TAGS
	createTag,
	renameTag,
	changeTagColor,
	deleteTag,
	updateTag,
	// STUFF
	useIsMobile,
	usePrimaryBarState,
	useNetworkState,
	getBridgedFunctions: (): unknown => {
		const { packageDependentFunctions, functions } = useContextBridge.getState();
		return {
			...functions,
			...reduce(packageDependentFunctions, (acc, f, name) => ({ ...acc, [name]: f(pkg.name) }), {})
		};
	},
	useAllConfig,
	useIsAdvanced,
	getIsAdvanced,
	useDomainInformation
});
