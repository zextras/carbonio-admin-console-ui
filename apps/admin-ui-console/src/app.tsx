/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	removeRoute,
	registerActions,
	getSoapFetchRequest,
	postSoapFetchRequest,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useUserSettings,
	useDomainStore,
	useHasRight,
	getRights,
	useCurrentUserRights
} from '@zextras/admin-ui-bootstrap';
import { Icon, Button } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import moment from 'moment';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import {
	APP_ID,
	BACKUP_ROUTE_ID,
	CARBONIO_SEND_ANALYTICS,
	COS,
	COS_ROUTE_ID,
	CREATE_COS,
	CREATE_NEW_COS_ROUTE_ID,
	CREATE_NEW_DOMAIN_ROUTE_ID,
	CREATE_TOP_DOMAIN,
	DASHBOARD,
	DOMAINS_ROUTE_ID,
	GLOBAL,
	LEGAL_HOLD_ROUTE_ID,
	LIST_COS,
	LIST_SERVER,
	LOG_AND_QUEUES,
	MANAGE,
	MANAGE_APP_ID,
	MTA,
	MTA_ROUTE_ID,
	NOTIFICATION_ROUTE_ID,
	OPERATIONS_ROUTE_ID,
	PRIMARY_BAR_BACKUP,
	PRIMARY_BAR_DASHBOARD,
	PRIMARY_BAR_DOMAINS,
	PRIMARY_BAR_LEGAL_HOLD,
	PRIMARY_BAR_MTA,
	PRIMARY_BAR_NOTIFICATIONS,
	PRIMARY_BAR_OPERATIONS,
	PRIMARY_BAR_PRIVACY,
	PRIMARY_BAR_STORAGE,
	PRIMARY_BAR_SUBSCRIPTIONS,
	PRIVACY_ROUTE_ID,
	SERVER,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_LAST_LOGON_TIMESTAMP,
	CONFIG
} from './constants';
import SvgBackupOutline from './icons/outline/BackupOutline';
import SettingsModOutline from './icons/outline/SettingsModOutline';
import { ReactQueryProvider } from './providers/query-client-provider';
import { getAccountRequest } from './services/get-account';
import {
	getAllServerByService,
	getAllServers,
	getMailstoresServers
} from './services/get-all-servers-service';
import { useAuthIsAdvanced } from './store/auth-advanced/store';
import { useBackupModuleStore } from './store/backup-module/store';
import { useBucketServersListStore } from './store/bucket-server-list/store';
import { useConfigStore } from './store/config/store';
import { useCosStore } from './store/cos/store';
import { useGlobalConfigStore } from './store/global-config/store';
import { useLastLoginTimestamp } from './store/last-login-time-stamp';
import { useMailstoreListStore } from './store/mailstore-list/store';
import { useModuleLicenseStore } from './store/module-license/store';
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

const PrimaryBarIconButton = styled(Button)`
	&:hover {
		background: transparent;
	}
	@media (max-width: 60rem) {
		padding: 0 0 0 0.188rem;
	}
`;
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
	const setServerList = useServerStore((state) => state.setServerList);
	const setMtaServerList = useServerStore((state) => state.setMtaServerList);
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
	const setIsAdvanced = useAuthIsAdvanced((state) => state.setIsAdvanced);
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
	const { setCosView } = useCosStore();
	const { data: rights } = useCurrentUserRights();
	const userName = accounts?.[0]?.name || '';
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);
	const { setDomainView, setDomain } = useDomainStore((state) => state);
	const setLastLoginTimestamp = useLastLoginTimestamp((state) => state.setLastLoginTimestamp);
	const { data: hasAllConfigRights = false } = useHasRight({
		userName,
		rightType: CONFIG,
		enabled: Boolean(userName)
	});
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
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.backup_primarybar_tooltip"
							defaults="Manage your <bold>backup services</bold>, view their <bold>status</bold>, the <bold>servers list</bold> or <bold>import an existing backup</bold>."
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

	const privacyTooltipItems = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.privacy_lbl"
							defaults="<bold>Privacy</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.privacy_primarybar_tooltip"
							defaults="Manage the <bold>Privacy</bold> settings such as <bold>data reports, error logs</bold> and <bold>surveys</bold>."
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
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.notification_primarybar_tooltip"
							defaults="View your <bold>notifications</bold>, mark them as <bold>read</bold> or <bold>copy</bold> to share them."
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
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.storage_primarybar_tooltip"
							defaults="View your <bold>server status</bold>, your <bold>volumes</bold> and <bold>HSM policies</bold>. You’ll also be able to <bold>connect buckets</bold>."
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
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.subscription_primarybar_tooltip"
							defaults="View your <bold>subscription details</bold> and/or <bold>activate</bold> your new one."
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
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.operation_primarybar_tooltip"
							defaults="View and manage the <bold>operations, run, manage</bold> and <bold>end them</bold>."
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

	const mtaTooltipItem = useMemo(
		() => [
			{
				header: (
					<>
						<Trans
							i18nKey="label.mta_lbl"
							defaults="<bold>MTA</bold>"
							components={{ bold: <strong /> }}
							t={t}
						/>
						{'\n\n'}
						<Trans
							i18nKey="label.mta_primarybar_tooltip"
							defaults="Mail Transfer Agent"
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

	const leagalHoldTooltipItem = useMemo(
		() => [
			{
				header: (
					<Trans
						i18nKey="label.legal_hold_lbl"
						defaults="<bold>Legal Hold</bold>"
						components={{ bold: <strong /> }}
						t={t}
					/>
				),
				options: []
			}
		],
		[t]
	);

	const OperationTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={operationTooltipItem} />,
		[operationTooltipItem]
	);

	const MTATooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={mtaTooltipItem} />,
		[mtaTooltipItem]
	);

	const backupPrimaryBar: FC = useCallback(
		() => (
			<PrimaryBarIconButton
				// @ts-ignore // Need to fix it with custom soultion
				icon={SvgBackupOutline}
				type="ghost"
				size={'extralarge'}
				color={'text'}
				onClick={(): void => history.push(`/${SERVICES_ROUTE_ID}/${BACKUP_ROUTE_ID}`)}
			/>
		),
		[history]
	);

	const LegalHoldTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={leagalHoldTooltipItem} />,
		[leagalHoldTooltipItem]
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
		if (rights && rights.length > 0) {
			const right = getRights(rights, SERVER);
			if (right.length > 0) {
				const findServerRight = right.find(
					(item: Record<string, string>) => item?.n && item?.n === LIST_SERVER
				);
				if (findServerRight) {
					sethasListServerRights(true);
				}
			}
		}
	}, [rights]);

	const setConfigRightsRoute = useCallback(() => {
		if (hasListServerRights) {
			addRoute({
				route: STORAGES_ROUTE_ID,
				position: 4,
				visible: true,
				label: t('label.storage', 'Storage') || '',
				primaryBar: 'HardDriveOutline',
				appView: AppView,
				primarybarSection: { ...managementSection },
				tooltip: StorageTooltipView,
				trackerLabel: PRIMARY_BAR_STORAGE
			});
		}

		if (hasAllConfigRights) {
			addRoute({
				route: MTA_ROUTE_ID,
				position: 3,
				visible: true,
				label: t('label.mail_trans_agent', 'Mail Trans. Agent') || '',
				primaryBar: 'MailFolderOutline',
				appView: AppView,
				primarybarSection: { ...managementSection },
				tooltip: MTATooltipView,
				trackerLabel: PRIMARY_BAR_MTA
			});
			if (isAdvanced) {
				addRoute({
					route: BACKUP_ROUTE_ID,
					position: 1,
					visible: true,
					label: t('label.backup', 'Backup') || '',
					// primaryBar: 'HistoryOutline',
					primaryBar: backupPrimaryBar,
					appView: AppView,
					primarybarSection: { ...servicesSection },
					tooltip: BackupTooltipView,
					trackerLabel: PRIMARY_BAR_BACKUP
				});
				addRoute({
					route: LEGAL_HOLD_ROUTE_ID,
					position: 2,
					visible: true,
					label: t('label.legal_hold', 'Legal Hold') || '',
					primaryBar: 'LockOutline',
					appView: AppView,
					primarybarSection: { ...servicesSection },
					tooltip: LegalHoldTooltipView,
					trackerLabel: PRIMARY_BAR_LEGAL_HOLD
				});
			}

			addRoute({
				route: PRIVACY_ROUTE_ID,
				position: 6,
				visible: true,
				label: t('label.privacy', 'Privacy') || '',
				primaryBar: 'ShieldOutline',
				appView: AppView,
				primarybarSection: { ...managementSection },
				tooltip: PrivacyTooltipView,
				trackerLabel: PRIMARY_BAR_PRIVACY
			});
		} else {
			removeRoute(BACKUP_ROUTE_ID);

			removeRoute(MTA_ROUTE_ID);
			removeRoute(PRIVACY_ROUTE_ID);
		}
	}, [
		BackupTooltipView,
		LegalHoldTooltipView,
		MTATooltipView,
		PrivacyTooltipView,
		StorageTooltipView,
		backupPrimaryBar,
		hasAllConfigRights,
		hasListServerRights,
		isAdvanced,
		managementSection,
		servicesSection,
		t
	]);

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

		setConfigRightsRoute();

		if (isAdvanced) {
			if (hasAllConfigRights) {
				addRoute({
					route: SUBSCRIPTIONS_ROUTE_ID,
					position: 5,
					visible: true,
					label: t('label.subscriptions', 'Subscriptions') || '',
					primaryBar: 'AwardOutline',
					appView: AppView,
					primarybarSection: { ...managementSection },
					tooltip: SubscriptionTooltipView,
					trackerLabel: PRIMARY_BAR_SUBSCRIPTIONS
				});

				addRoute({
					route: LEGAL_HOLD_ROUTE_ID,
					position: 2,
					visible: true,
					label: t('label.legal_hold', 'Legal Hold') || '',
					primaryBar: 'LockOutline',
					appView: AppView,
					primarybarSection: { ...servicesSection },
					tooltip: LegalHoldTooltipView,
					trackerLabel: PRIMARY_BAR_LEGAL_HOLD
				});
			} else {
				removeRoute(SUBSCRIPTIONS_ROUTE_ID);
				removeRoute(LEGAL_HOLD_ROUTE_ID);
			}

			addRoute({
				route: NOTIFICATION_ROUTE_ID,
				position: 1,
				visible: true,
				label: t('label.notifications', 'Notifications') || '',
				primaryBar: 'BellOutline',
				appView: AppView,
				primarybarSection: { ...logAndQueuesSection },
				tooltip: NotificationTooltipView,
				trackerLabel: PRIMARY_BAR_NOTIFICATIONS
			});

			addRoute({
				route: OPERATIONS_ROUTE_ID,
				position: 2,
				visible: true,
				label: t('label.operations', 'Operations') || '',
				primaryBar: 'ListOutline',
				appView: AppView,
				primarybarSection: { ...logAndQueuesSection },
				tooltip: OperationTooltipView,
				trackerLabel: PRIMARY_BAR_OPERATIONS
			});
		}
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
		NotificationTooltipView,
		hasListServerRights,
		MTATooltipView,
		showCOS,
		hasAllConfigRights,
		cosPrimaryBar,
		LegalHoldTooltipView,
		setConfigRightsRoute
	]);

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
	}, [t, history, setDomainView, setDomain, setCosView, createDomainRight, createCosRight]);

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
