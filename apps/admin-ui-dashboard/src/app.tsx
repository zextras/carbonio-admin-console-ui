/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	getSoapFetchRequest,
	postSoapFetchRequest,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useUserSettings
} from '@zextras/admin-ui-bootstrap';
import { useSnackbar } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	CARBONIO_SEND_ANALYTICS,
	DASHBOARD,
	MTA,
	PRIMARY_BAR_DASHBOARD,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_LAST_LOGON_TIMESTAMP
} from './constants';
import { ReactQueryProvider } from './providers/query-client-provider';
import { getAccountRequest } from './services/get-account';
import { getAllEffectiveRigthsRequest } from './services/get-all-effective-rights';
import {
	getAllServerByService,
	getAllServers,
	getMailstoresServers
} from './services/get-all-servers-service';
import { useBackupModuleStore } from './store/backup-module/store';
import { useBucketServersListStore } from './store/bucket-server-list/store';
import { useConfigStore } from './store/config/store';
import { useGlobalConfigStore } from './store/global-config/store';
import { useLastLoginTimestamp } from './store/last-login-time-stamp';
import { useMailstoreListStore } from './store/mailstore-list/store';
import { useModuleLicenseStore } from './store/module-license/store';
import { useRightsStore } from './store/rights/store';
import { useServerStore } from './store/server/store';
import { TrackerProvider } from './tracker/provider';
import { Spinner } from './views/components/spinner';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<ReactQueryProvider>
		<TrackerProvider>
			<Suspense fallback={<Spinner />}>
				<LazyAppView {...props} />
			</Suspense>
		</TrackerProvider>
	</ReactQueryProvider>
);

const App: FC = () => {
	const [t] = useTranslation();
	const setServerList = useServerStore((state) => state.setServerList);
	const setMtaServerList = useServerStore((state) => state.setMtaServerList);
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
	const setBackupServerList = useBackupModuleStore((state) => state.setBackupServerList);
	const { setAllServersList, setVolumeList } = useBucketServersListStore((state) => state);
	const { config, setConfig, setUserId } = useConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const { setAllMailstoreList } = useMailstoreListStore((state) => state);
	const setLicenseInfo = useModuleLicenseStore((state) => state.setLicenseInfo);
	const accounts = useUserAccounts();
	const setRights = useRightsStore((state) => state.setRights);
	const createSnackbar = useSnackbar();
	const setLastLoginTimestamp = useLastLoginTimestamp((state) => state.setLastLoginTimestamp);
	const userSetting = useUserSettings();
	const getAccountDetails = useCallback(
		(id: any) => {
			getAccountRequest(id, '', 0).then((res: any) => {
				const lastLogin = res?.account?.[0]?.a?.find(
					(ele: any) => ele.n === ZIMBRA_LAST_LOGON_TIMESTAMP
				);
				setLastLoginTimestamp(
					moment(lastLogin?._content, 'YYYYMMDDHHmmss.SSSZ').format('dddd DD MMM YYYY | h:mm a')
				);
			});
		},
		[setLastLoginTimestamp]
	);

	useEffect(() => {
		if (userSetting?.attrs?.zimbraId) {
			getAccountDetails(userSetting?.attrs?.zimbraId);
		}
	}, [getAccountDetails, userSetting?.attrs?.zimbraId]);

	useEffect(() => {
		if (accounts?.length > 0) {
			// FIX-ADMIN-MONOREPO
			const { id } = accounts[0];
			setUserId(id);
		}
	}, [accounts, setUserId]);

	useEffect(() => {
		if (!!accounts && Array.isArray(accounts) && accounts.length > 0 && accounts[0]?.name) {
			getAllEffectiveRigthsRequest(accounts[0]?.name)
				.then((res) => {
					setRights(res?.target);
				})
				.catch(() => {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t(
							'label.error_rights_message',
							'Error obtaining Rights. Please try again later.'
						),
						autoHideTimeout: 4000,
						hideButton: true,
						replace: true
					});
				});
		}
	}, [accounts, createSnackbar, setRights, t]);

	useEffect(() => {
		const sendAnalytics = config.filter((items) => items.n === CARBONIO_SEND_ANALYTICS)[0]
			?._content;
		sendAnalytics === TRUE
			? setGlobalCarbonioSendAnalytics(true)
			: setGlobalCarbonioSendAnalytics(false);
	}, [config, setGlobalCarbonioSendAnalytics]);

	useEffect(() => {
		if (allConfig && allConfig.length > 0) {
			setConfig(allConfig);
		}
	}, [allConfig, setConfig]);

	const homeTooltipItems = useMemo(
		() => [
			{
				header: (
					<Trans
						i18nKey="label.dashboard"
						defaults="<bold>Dashboard</bold>"
						components={{ bold: <strong /> }}
						t={t}
					/>
				),
				options: []
			}
		],
		[t]
	);

	const HomeTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={homeTooltipItems} />,
		[homeTooltipItems]
	);

	useEffect(() => {
		addRoute({
			route: DASHBOARD,
			position: 1,
			visible: true,
			label: t('label.dashboard', 'Dashboard') || '',
			primaryBar: 'HomeOutline',
			appView: AppView,
			tooltip: HomeTooltipView,
			trackerLabel: PRIMARY_BAR_DASHBOARD
		});
	}, [HomeTooltipView, t]);

	const checkIsBackupModuleEnable = useCallback(() => {
		getSoapFetchRequest(`/service/extension/zextras_admin/core/getAllServers?module=zxbackup`).then(
			(data: any) => {
				const backupServer = data?.servers;
				if (backupServer && Array.isArray(backupServer) && backupServer.length > 0) {
					setBackupServerList(backupServer);
					setBackupModuleEnable(true);
				} else {
					setBackupModuleEnable(false);
				}
			}
		);
	}, [setBackupModuleEnable, setBackupServerList]);

	const getGlobalConfig = useCallback(() => {
		postSoapFetchRequest(`/service/admin/soap/zextras`, {
			zextras: {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxConfig',
				action: 'dump_global_config'
			}
		}).then((data: any) => {
			const responseData = JSON.parse(data?.Body?.response?.content);
			const globalConfig = responseData?.response;
			if (globalConfig) {
				setGlobalConfig(globalConfig);
			}
		});
	}, [setGlobalConfig]);

	const getAllServersRequest = useCallback(() => {
		getAllServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setServerList(server);
				if (isAdvanced) {
					checkIsBackupModuleEnable();
					getGlobalConfig();
				}
				setAllServersList(server);
			}
		});
		getAllServerByService(MTA).then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setMtaServerList(server);
			}
		});
	}, [
		setServerList,
		isAdvanced,
		setAllServersList,
		checkIsBackupModuleEnable,
		getGlobalConfig,
		setMtaServerList
	]);

	const getMailstoresServersRequest = useCallback(() => {
		getMailstoresServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setVolumeList(server);
				setAllMailstoreList(server);
			}
		});
	}, [setVolumeList, setAllMailstoreList]);

	const getModuleLicense = useCallback(() => {
		postSoapFetchRequest(`/service/admin/soap/zextras`, {
			zextras: {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxCore',
				action: 'getLicenseInfo'
			}
		})
			.then((res: any) => res.Body)
			.then((res: any) => {
				const response = JSON.parse(res.response.content);
				if (response.ok) {
					setLicenseInfo(response.response);
				}
			});
	}, [setLicenseInfo]);

	useEffect(() => {
		getAllServersRequest();
		// another call just to get only mailstores can be improvised later
		getMailstoresServersRequest();
		getModuleLicense();
	}, [getAllServersRequest, getMailstoresServersRequest, getModuleLicense]);

	return null;
};

export default App;
