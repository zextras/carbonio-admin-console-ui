/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import {
	addRoute,
	registerActions,
	setAppContext,
	Spinner,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	useAllConfig,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	useIsAdvanced
} from '@zextras/carbonio-shell-ui';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Icon, IconButton } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { MatomoProvider } from '@datapunt/matomo-tracker-react';
import {
	APPLICATION_LOG,
	APP_ID,
	BACKUP_ROUTE_ID,
	CARBONIO_ALLOW_FEEDBACK,
	CARBONIO_SEND_ANALYTICS,
	CARBONIO_SEND_FULL_ERROR_STACK,
	COS_ROUTE_ID,
	CREATE_NEW_COS_ROUTE_ID,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	LOG_AND_QUEUES,
	MANAGE,
	MANAGE_APP_ID,
	MONITORING,
	MTA,
	NOTIFICATION_ROUTE_ID,
	OPERATIONS_ROUTE_ID,
	PRIVACY_ROUTE_ID,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID,
	TRUE
} from './constants';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';
import { useServerStore } from './store/server/store';
import { useGlobalConfigStore } from './store/global-config/store';
import { useBackupModuleStore } from './store/backup-module/store';
import { getAllServers, getMailstoresServers } from './services/get-all-servers-service';
import { useConfigStore } from './store/config/store';
import { getAllConfig } from './services/get-all-config';
import { useAuthIsAdvanced } from './store/auth-advanced/store';
import SvgBackupOutline from './icons/outline/BackupOutline';
import { useBucketServersListStore } from './store/bucket-server-list/store';
import MatomoTracker from './matomo-tracker';
import { useMailstoreListStore } from './store/mailstore-list/store';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<MatomoProvider value={MatomoTracker.matomoInstance}>
		<Suspense fallback={<Spinner />}>
			<LazyAppView {...props} />
		</Suspense>
	</MatomoProvider>
);

const PrimaryBarIconButton = styled(IconButton)`
	&:hover {
		background: transparent;
	}
`;

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const setServerList = useServerStore((state) => state.setServerList);
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
	const setIsAdvanced = useAuthIsAdvanced((state) => state.setIsAdvanced);
	const setBackupServerList = useBackupModuleStore((state) => state.setBackupServerList);
	const { setAllServersList, setVolumeList } = useBucketServersListStore((state) => state);
	const { config, setConfig } = useConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const { setAllMailstoreList } = useMailstoreListStore((state) => state);

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
		if (isAdvanced) {
			setIsAdvanced(isAdvanced);
		}
	}, [isAdvanced, setIsAdvanced]);

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);
	const servicesSection = useMemo(
		() => ({
			id: SERVICES_ROUTE_ID,
			label: t('label.services', 'Services'),
			position: 4
		}),
		[t]
	);

	const logAndQueuesSection = useMemo(
		() => ({
			id: LOG_AND_QUEUES,
			label: t('label.long_and_queues', 'Log & Queues'),
			position: 5
		}),
		[t]
	);

	const backupTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.backup_lbl"
							defaults="<bold>Backup</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.backup_primarybar_tooltip"
							defaults="Manage your <bold>backup services, view</bold> its <bold>status</bold>, the <bold>server’s list</bold> or <bold>import an existing one</bold>."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const BackupTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={backupTooltipItems} />,
		[backupTooltipItems]
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
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.cos_primarybar_tooltip"
							defaults="View and manage your <bold>Class of Services</bold> details, <bold>features, Server Pools</bold> and <bold>Advanced</bold> settings."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const CosTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={cosTooltipItems} />,
		[cosTooltipItems]
	);

	const privacyTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.privacy_lbl"
							defaults="<bold>Privacy</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.privacy_primarybar_tooltip"
							defaults="Manage the <bold>Privacy</bold> settings such as <bold>data reports, error logs</bold> and <bold>surveys</bold>."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const PrivacyTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={privacyTooltipItems} />,
		[privacyTooltipItems]
	);

	const notificationTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.notification_lbl"
							defaults="<bold>Notifications</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.notification_primarybar_tooltip"
							defaults="View your <bold>notifications</bold>, mark them as <bold>read</bold> or <bold>copy</bold> to share them."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const NotificationTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={notificationTooltipItems} />,
		[notificationTooltipItems]
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
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.domain_primarybar_tooltip"
							defaults="View your <bold>domains details</bold> and <bold>manage</bold> their resources such as <bold>accounts, mailing lists, resources</bold> and <bold>more</bold>."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const homeTooltipItems = useMemo(
		() => [
			{
				header: t('label.home', 'Home'),
				options: []
			}
		],
		[t]
	);

	const HomeTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={homeTooltipItems} />,
		[homeTooltipItems]
	);

	const DomainTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={domainsTooltipItems} />,
		[domainsTooltipItems]
	);

	const storagesTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.storage_lbl"
							defaults="<bold>Storage</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.storage_primarybar_tooltip"
							defaults="View your <bold>server status</bold>, your <bold>volumes</bold> and <bold>HSM policies</bold>. You’ll also be able to <bold>connect buckets</bold>."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const StorageTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={storagesTooltipItems} />,
		[storagesTooltipItems]
	);

	const subscriptionTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.subscription_lbl"
							defaults="<bold>Subscription</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.subscription_primarybar_tooltip"
							defaults="View your <bold>subscription details</bold> and/or <bold>activate</bold> your new one."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const SubscriptionTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={subscriptionTooltipItems} />,
		[subscriptionTooltipItems]
	);

	const operationTooltipItem = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.operation_lbl"
							defaults="<bold>Operations</bold>"
							components={{ bold: <strong /> }}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.operation_primarybar_tooltip"
							defaults="View and manage the <bold>operations, run, manage</bold> and <bold>end them</bold>."
							components={{ bold: <strong /> }}
						/>
					</>
				),
				options: []
			}
		],
		[]
	);

	const OperationTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={operationTooltipItem} />,
		[operationTooltipItem]
	);

	const backupPrimaryBar: FC = useCallback(
		() => (
			<PrimaryBarIconButton
				icon={SvgBackupOutline}
				size="large"
				onClick={(): void => history.push(`/${SERVICES_ROUTE_ID}/${BACKUP_ROUTE_ID}`)}
			/>
		),
		[history]
	);

	useEffect(() => {
		addRoute({
			route: DASHBOARD,
			position: 1,
			visible: true,
			label: t('label.dashboard', 'Dashboard'),
			primaryBar: 'HomeOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			tooltip: HomeTooltipView
		});

		addRoute({
			route: DOMAINS_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.domains', 'Domains'),
			primaryBar: 'AtOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: DomainTooltipView
		});
		addRoute({
			route: STORAGES_ROUTE_ID,
			position: 3,
			visible: true,
			label: t('label.storage', 'Storage'),
			primaryBar: 'HardDriveOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: StorageTooltipView
		});
		addRoute({
			route: COS_ROUTE_ID,
			position: 2,
			visible: true,
			label: t('label.cos', 'COS'),
			primaryBar: 'CosOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: CosTooltipView
		});
		if (isAdvanced) {
			addRoute({
				route: SUBSCRIPTIONS_ROUTE_ID,
				position: 4,
				visible: true,
				label: t('label.subscriptions', 'Subscriptions'),
				primaryBar: 'AwardOutline',
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...managementSection },
				tooltip: SubscriptionTooltipView
			});

			addRoute({
				route: BACKUP_ROUTE_ID,
				position: 1,
				visible: true,
				label: t('label.backup', 'Backup'),
				// primaryBar: 'HistoryOutline',
				primaryBar: backupPrimaryBar,
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...servicesSection },
				tooltip: BackupTooltipView
			});

			addRoute({
				route: NOTIFICATION_ROUTE_ID,
				position: 1,
				visible: true,
				label: t('label.notifications', 'Notifications'),
				primaryBar: 'BellOutline',
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...logAndQueuesSection },
				tooltip: NotificationTooltipView
			});

			addRoute({
				route: OPERATIONS_ROUTE_ID,
				position: 2,
				visible: true,
				label: t('label.operations', 'Operations'),
				primaryBar: 'ListOutline',
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...logAndQueuesSection },
				tooltip: OperationTooltipView
			});

			addRoute({
				route: OPERATIONS_ROUTE_ID,
				position: 2,
				visible: true,
				label: t('label.operations', 'Operations'),
				primaryBar: 'ListOutline',
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...logAndQueuesSection },
				tooltip: OperationTooltipView
			});

			addRoute({
				route: OPERATIONS_ROUTE_ID,
				position: 2,
				visible: true,
				label: t('label.operations', 'Operations'),
				primaryBar: 'ListOutline',
				appView: AppView,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primarybarSection: { ...logAndQueuesSection },
				tooltip: OperationTooltipView
			});
		}
		addRoute({
			route: PRIVACY_ROUTE_ID,
			position: 5,
			visible: true,
			label: t('label.privacy', 'Privacy'),
			primaryBar: 'ShieldOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: PrivacyTooltipView
		});

		setAppContext({ cabonio_admin_console_ui: 'cabonio_admin_console_ui' });
	}, [
		t,
		managementSection,
		servicesSection,
		BackupTooltipView,
		CosTooltipView,
		DomainTooltipView,
		StorageTooltipView,
		SubscriptionTooltipView,
		logAndQueuesSection,
		backupPrimaryBar,
		isAdvanced,
		OperationTooltipView,
		HomeTooltipView,
		PrivacyTooltipView,
		NotificationTooltipView
	]);

	useEffect(() => {
		registerActions({
			action: (): any => ({
				id: 'new-domain',
				label: t('label.create_new_domain', 'Create New Domain'),
				icon: '',
				click: (ev: any): void => {
					history.push(`/${MANAGE}/${DOMAINS_ROUTE_ID}/${CREATE_NEW_DOMAIN_ROUTE_ID}`);
				},
				disabled: false,
				group: APP_ID,
				primary: false
			}),
			id: 'new-domain',
			type: 'new'
		});
		registerActions({
			action: (): any => ({
				id: 'new-cos',
				label: t('label.create_new_cos', 'Create New COS'),
				icon: '',
				click: (ev: any): void => {
					history.push(`/${MANAGE}/${COS_ROUTE_ID}/${CREATE_NEW_COS_ROUTE_ID}`);
				},
				disabled: false,
				group: APP_ID,
				primary: false
			}),
			id: 'new-cos',
			type: 'new'
		});
		history.push(`/${DASHBOARD}`);
	}, [t, history]);

	const checkIsBackupModuleEnable = useCallback(
		(servers) => {
			getSoapFetchRequest(
				`/service/extension/zextras_admin/core/getAllServers?module=zxbackup`
			).then((data: any) => {
				const backupServer = data?.servers;
				if (backupServer && Array.isArray(backupServer) && backupServer.length > 0) {
					setBackupServerList(backupServer);
					setBackupModuleEnable(true);
				} else {
					setBackupModuleEnable(false);
				}
			});
		},
		[setBackupModuleEnable, setBackupServerList]
	);
	const getGlobalConfig = useCallback(
		(serverName) => {
			postSoapFetchRequest(`/service/admin/soap/zextras`, {
				zextras: {
					_jsns: 'urn:zimbraAdmin',
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
		},
		[setGlobalConfig]
	);

	const getAllServersRequest = useCallback(() => {
		getAllServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setServerList(server);
				if (isAdvanced) {
					checkIsBackupModuleEnable(server);
					getGlobalConfig(server[0]?.name);
				}
				setAllServersList(server);
			}
		});
	}, [setServerList, checkIsBackupModuleEnable, setAllServersList, getGlobalConfig, isAdvanced]);

	const getMailstoresServersRequest = useCallback(() => {
		getMailstoresServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setVolumeList(server);
				setAllMailstoreList(server);
			}
		});
	}, [setVolumeList, setAllMailstoreList]);

	useEffect(() => {
		getAllServersRequest();
		// another call just to get only mailstores can be improvised later
		getMailstoresServersRequest();
	}, [getAllServersRequest, getMailstoresServersRequest]);

	return null;
};

export default App;
