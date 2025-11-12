/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	useGlobalConfigStore,
	useServerStore,
	useBackupModule,
	useBackupServers,
	useBackupModuleEnable,
	useRemoveLicense,
	useActivateLicense,
	useLicenseInfo,
	useVersion,
	useContextBridge,
	useModuleLicenseInfo
} from '../../../exports';
import { CarbonioModule } from '../../../types';
import { replaceHistory } from '../../history/hooks';
import {
	getSoapFetch,
	getSoapFetchRequest,
	postSoapFetchRequest,
	fetchExternalSoap
} from '../../network/fetch';
import { useLastLoginTimestamp } from '../../react-query/use-last-login-timestamp';
import { usePrimaryBarState, useNetworkState } from '../../shell/hooks';
import { useUserAccount, useUserAccounts, useUserSettings } from '../../store/account';
import { getIsAdvanced, useIsAdvanced } from '../../store/advance';
import { useAllConfig } from '../../store/config';
import { useDomainInformation } from '../../store/domain-information';
import { getIntegratedFunction } from '../../store/integrations/getters';
import { useIntegratedComponent } from '../../store/integrations/hooks';
import { useAdminConfigStore, useConfigurationAttribute } from '../../store/shared/admin-config';
import { useBucketServersListStore } from '../../store/shared/bucket-server-list';
import { useDomainStore } from '../../store/shared/domains/store';
import { getTags } from '../../store/tags';

export const getAppFunctions = (pkg: CarbonioModule): Record<string, Function> => ({
	soapFetch: getSoapFetch(pkg.name),
	getSoapFetchRequest: getSoapFetchRequest(pkg.name),
	postSoapFetchRequest: postSoapFetchRequest(pkg.name),
	fetchExternalSoap: fetchExternalSoap(pkg.name),

	// INTEGRATIONS
	getIntegratedFunction,
	useIntegratedComponent,
	// ACCOUNTS
	useUserAccount,
	useUserAccounts,
	useUserSettings,
	getTags,
	// HISTORY
	replaceHistory,
	// STUFF
	usePrimaryBarState,
	useNetworkState,
	useAllConfig,
	useIsAdvanced,
	getIsAdvanced,
	useDomainInformation,
	// STORES
	useDomainStore,
	useServerStore,
	useGlobalConfigStore,
	useBackupModule,
	useBackupServers,
	useBackupModuleEnable,
	useAdminConfigStore,
	useConfigurationAttribute,
	useLastLoginTimestamp,
	useBucketServersListStore,
	useRemoveLicense,
	useActivateLicense,
	useLicenseInfo,
	useVersion,
	useModuleLicenseInfo,
	useContextBridge
});
