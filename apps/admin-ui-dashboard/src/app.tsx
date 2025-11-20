/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	postSoapFetchRequest,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useUserSettings
} from '@zextras/admin-ui-bootstrap';
import moment from 'moment';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	CARBONIO_SEND_ANALYTICS,
	DASHBOARD,
	PRIMARY_BAR_DASHBOARD,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_LAST_LOGON_TIMESTAMP
} from './constants';
import { getAccountRequest } from './services/get-account';
import { getAllServers } from './services/get-all-servers-service';
import { useConfigStore } from './store/config/store';
import { useGlobalConfigStore } from './store/global-config/store';
import { useLastLoginTimestamp } from './store/last-login-time-stamp';
import { TrackerProvider } from './tracker/provider';
import { Spinner } from './views/components/spinner';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<TrackerProvider>
		<Suspense fallback={<Spinner />}>
			<LazyAppView {...props} />
		</Suspense>
	</TrackerProvider>
);

const App: FC = () => {
	const [t] = useTranslation();
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const { config, setConfig, setUserId } = useConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const accounts = useUserAccounts();
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
				if (isAdvanced) {
					getGlobalConfig();
				}
			}
		});
	}, [isAdvanced, getGlobalConfig]);

	
	useEffect(() => {
		getAllServersRequest();
	}, [getAllServersRequest]);

	return null;
};

export default App;
