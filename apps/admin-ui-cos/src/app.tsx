/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	removeRoute,
	registerActions,
	postSoapFetchRequest,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useCurrentUserRights,
	useGlobalConfigStore,
	useAppConfigStore
} from '@zextras/admin-ui-bootstrap';
import { Icon } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import {
	APP_ID,
	CARBONIO_SEND_ANALYTICS,
	COS,
	COS_ROUTE_ID,
	CREATE_COS,
	CREATE_NEW_COS_ROUTE_ID,
	DASHBOARD,
	GLOBAL,
	LIST_COS,
	MANAGE,
	MANAGE_APP_ID,
	PRIMARY_BAR_COS,
	SERVICES_ROUTE_ID,
	TRUE,
	ZIMBRA_ADMIN_URN
} from './constants';
import SettingsModOutline from './icons/outline/SettingsModOutline';
import { getAllServers } from './services/get-all-servers-service';
import { useCosStore } from './store/cos/store';
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
const PrimaryBarIcon = styled(Icon)`
	&:hover {
		background: transparent;
	}
	@media (max-width: 60rem) {
		padding: 0 0 0 0.188rem;
	}
`;

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const { config, setConfig, setUserId } = useAppConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const accounts = useUserAccounts();
	const { setCosView } = useCosStore();
	const { data: rights } = useCurrentUserRights();

	useEffect(() => {
		if (accounts?.length > 0) {
			// FIX-ADMIN-MONOREPO
			const { id } = accounts[0];
			setUserId(id);
		}
	}, [accounts, setUserId]);

	const showCOS = useMemo(() => {
		const rightsConfig = find(rights, { type: COS }) ?? { all: [], type: COS };
		return !!(
			rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
			rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
			find(rightsConfig?.all?.[0]?.right, { n: LIST_COS })
		);
	}, [rights]);

	const createCosRight = useMemo(() => {
		const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
		return !!(
			rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
			rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
			find(rightsConfig?.all?.[0]?.right, { n: CREATE_COS })
		);
	}, [rights]);

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

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);

	const cosTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.class_of_service_lbl"
							defaults="<bold>Class of Service</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.cos_primarybar_tooltip"
							defaults="View and manage your <bold>Class of Services</bold> details, <bold>features, Server Pools</bold> and <bold>Advanced</bold> settings."
							components={{ bold: <strong /> }}
							t={t}
						/>
					</>
				),
				options: []
			}
		],
		[t]
	);

	const CosTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={cosTooltipItems} />,
		[cosTooltipItems]
	);

	const cosPrimaryBar = useCallback(
		() => (
			<PrimaryBarIcon
				icon={SettingsModOutline}
				size="large"
				onClick={(): void => history.push(`/${SERVICES_ROUTE_ID}/${COS_ROUTE_ID}`)}
			/>
		),
		[history]
	);
	useEffect(() => {
		if (showCOS) {
			addRoute({
				route: COS_ROUTE_ID,
				position: 2,
				visible: true,
				label: t('label.cos', 'COS') || '',
				primaryBar: cosPrimaryBar,
				appView: AppView,
				primarybarSection: { ...managementSection },
				tooltip: CosTooltipView,
				trackerLabel: PRIMARY_BAR_COS
			});
		} else {
			removeRoute(COS_ROUTE_ID);
		}
	}, [CosTooltipView, cosPrimaryBar, managementSection, showCOS, t]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-cos',
				label: t('label.create_new_cos', 'Create New COS'),
				icon: '',
				onClick: (ev: any): void => {
					history.push(`/${MANAGE}/${COS_ROUTE_ID}/${CREATE_NEW_COS_ROUTE_ID}`);
					setCosView(CREATE_NEW_COS_ROUTE_ID);
				},
				disabled: !createCosRight,
				group: APP_ID,
				primary: false
			}),
			id: 'new-cos',
			type: 'new'
		});
		history.push(`/${DASHBOARD}`);
	}, [createCosRight, history, setCosView, t]);

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
			if (server && Array.isArray(server) && server.length > 0 && isAdvanced) {
				getGlobalConfig();
			}
		});
	}, [isAdvanced, getGlobalConfig]);

	useEffect(() => {
		getAllServersRequest();
	}, [getAllServersRequest]);

	return null;
};

export default App;
