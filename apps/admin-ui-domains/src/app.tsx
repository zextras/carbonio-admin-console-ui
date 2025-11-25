/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	registerActions,
	getSoapFetchRequest,
	postSoapFetchRequest,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useDomainStore,
	useCurrentUserRights,
	useMailstoreServers,
	useGlobalConfigStore,
	useAppConfigStore,
	useAllServers,
	useMtaServers
} from '@zextras/admin-ui-bootstrap';
import { find } from 'lodash';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
	APP_ID,
	CARBONIO_SEND_ANALYTICS,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	CREATE_TOP_DOMAIN,
	DOMAINS_ROUTE_ID,
	GLOBAL,
	MANAGE,
	MANAGE_APP_ID,
	PRIMARY_BAR_DOMAINS,
	TRUE,
	ZIMBRA_ADMIN_URN
} from './constants';
import { useBackupModuleStore } from './store/backup-module/store';
import { useBucketServersListStore } from './store/bucket-server-list/store';
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
	const history = useHistory();
	const { data: serverList = [] } = useAllServers();
	const { data: _mtaServerList = [] } = useMtaServers();
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
	const setBackupServerList = useBackupModuleStore((state) => state.setBackupServerList);
	const { setAllServersList, setVolumeList } = useBucketServersListStore((state) => state);
	const { config, setConfig, setUserId } = useAppConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const accounts = useUserAccounts();
	const { data: rights } = useCurrentUserRights();
	const { setDomainView, setDomain } = useDomainStore((state) => state);

	const { data: mailstoreServers } = useMailstoreServers();

	useEffect(() => {
		if (accounts?.length > 0) {
			const { id } = accounts[0];
			setUserId(id);
		}
	}, [accounts, setUserId]);

	const createDomainRight = useMemo(() => {
		const rightsConfig = find(rights, { type: GLOBAL }) ?? { all: [], type: GLOBAL };
		return !!(
			rightsConfig?.all?.[0]?.getAttrs?.[0]?.all ??
			rightsConfig?.all?.[0]?.setAttrs?.[0]?.all ??
			find(rightsConfig?.all?.[0]?.right, { n: CREATE_TOP_DOMAIN })
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

	useEffect(() => {
		if (mailstoreServers && mailstoreServers.length > 0) {
			setVolumeList(mailstoreServers);
		}
	}, [mailstoreServers, setVolumeList]);

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);

	const domainsTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.domains_lbl"
							defaults="<bold>Domains</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.domain_primarybar_tooltip"
							defaults="View your <bold>domains details</bold> and <bold>manage</bold> their resources such as <bold>accounts, distribution lists, resources</bold> and <bold>more</bold>."
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

	const DomainTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={domainsTooltipItems} />,
		[domainsTooltipItems]
	);

	useEffect(() => {
		addRoute({
			route: DOMAINS_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.domains', 'Domains') || '',
			primaryBar: 'AtOutline',
			appView: AppView,
			primarybarSection: { ...managementSection },
			tooltip: DomainTooltipView,
			trackerLabel: PRIMARY_BAR_DOMAINS
		});
	}, [DomainTooltipView, managementSection, t]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-domain',
				label: t('label.create_new_domain', 'Create New Domain'),
				icon: '',
				onClick: (ev: any): void => {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
					setDomain({});
					setTimeout(() => {
						setDomainView(CREATE_NEW_DOMAIN_ROUTE_ID);
					}, 100);
				},
				disabled: !createDomainRight,
				group: APP_ID,
				primary: false
			}),
			id: 'new-domain',
			type: 'new'
		});
	}, [createDomainRight, history, setDomain, setDomainView, t]);

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

	// Handle server list changes
	useEffect(() => {
		if (serverList && serverList.length > 0) {
			if (isAdvanced) {
				checkIsBackupModuleEnable();
				getGlobalConfig();
			}
			setAllServersList(serverList);
		}
	}, [serverList, isAdvanced, checkIsBackupModuleEnable, getGlobalConfig, setAllServersList]);

	return null;
};

export default App;
