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
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
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
	OPERATIONS,
	PRIVACY_ROUTE_ID,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	SUBSCRIPTIONS_ROUTE_ID
} from './constants';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';
import { useServerStore } from './store/server/store';
import { useGlobalConfigStore } from './store/global-config/store';
import { useBackupModuleStore } from './store/backup-module/store';
import { getAllServers } from './services/get-all-servers-service';
import { useConfigStore } from './store/config/store';
import { getAllConfig } from './services/get-all-config';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const App: FC = () => {
	const [t] = useTranslation();
	const history = useHistory();
	const setServerList = useServerStore((state) => state.setServerList);
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const setBackupModuleEnable = useBackupModuleStore((state) => state.setBackupModuleEnable);
	const setConfig = useConfigStore((state) => state.setConfig);
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
				header: t('label.backup', 'BACKUP'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.default_settings', 'Default Settings'),
				options: [
					{
						label: t('label.server_config', 'Server Config')
					},
					{
						label: t('label.advanced', 'Advanced')
					}
				]
			},
			{
				header: t('label.server_settings', 'Server Settings'),
				options: [
					{
						label: t('label.servers_list', 'Servers List')
					}
				]
			},
			{
				header: t('label.actions', 'Actions'),
				options: [
					{
						label: t('label.import_an_external_backup', 'Import an External Backup')
					}
				]
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
				header: t('label.cos', 'COS'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.details', 'Details'),
				options: [
					{
						label: t('label.general_information', 'General Information')
					},
					{
						label: t('label.features', 'Features')
					},
					{
						label: t('label.preferences', 'Preferences')
					},
					{
						label: t('label.server_pools', 'Server Pools')
					},
					{
						label: t('label.advanced', 'Advanced')
					},
					{
						label: t('label.retention_policy', 'Retention Policy')
					}
				]
			}
		],
		[t]
	);

	const CosTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={cosTooltipItems} />,
		[cosTooltipItems]
	);

	const domainsTooltipItems = useMemo(
		() => [
			{
				header: t('label.domains', 'DOMAINS'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.details', 'Details'),
				options: [
					{
						label: t('label.domain_status', 'Domain Status')
					},
					{
						label: t('label.general_Settings', 'General Settings')
					},
					{
						label: t('label.gal', 'GAL')
					},
					{
						label: t('label.authentication', 'Authentication')
					},
					{
						label: t('label.virtual_hosts', 'Virtual Hosts')
					},
					{
						label: t('label.mailbox_quota', 'Mailbox Quota')
					}
				]
			},
			{
				header: t('label.management', 'Management'),
				options: [
					{
						label: t('label.accounts', 'Accounts')
					},
					{
						label: t('label.mailing_lists', 'Mailing Lists')
					},
					{
						label: t('label.resources', 'Resources')
					},
					{
						label: t('label.admin_delegates', 'Admin Delegates')
					},
					{
						label: t('label.active_sync', 'ActiveSync')
					},
					{
						label: t('label.account_scan', 'AccountScan')
					},
					{
						label: t('label.export_domain', 'Export Domain')
					},
					{
						label: t('label.restore_account', 'Restore Account')
					},
					{
						label: t('label.restore_deleted_email', 'Restore Deleted E-mail')
					}
				]
			}
		],
		[t]
	);

	const DomainTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={domainsTooltipItems} />,
		[domainsTooltipItems]
	);

	const storagesTooltipItems = useMemo(
		() => [
			{
				header: t('label.mail_stores', 'Mailstores'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.servers', 'Servers'),
				options: [
					{
						label: t('label.service_status', 'Service_Status')
					},
					{
						label: t('label.data_volumes', 'Data Volumes')
					},
					{
						label: t('label.hsm_policies', 'HSM Policies')
					},
					{
						label: t('label.indexer_settings', 'Indexer Settings')
					},
					{
						label: t('label.index_volumes', 'Index Volumes')
					}
				]
			},
			{
				header: t('label.buckets', 'Buckets'),
				options: [
					{
						label: t('label.connect_buckets', 'Connect Buckets')
					}
				]
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
				header: t('label.subscriptions', 'SUBSCRIPTIONS'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.subscription', 'Subscription'),
				options: [
					{
						label: t('label.details', 'Details')
					},
					{
						label: t('label.activate_and_update', 'Activate & Update')
					}
				]
			}
		],
		[t]
	);

	const SubscriptionTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={subscriptionTooltipItems} />,
		[subscriptionTooltipItems]
	);

	useEffect(() => {
		addRoute({
			route: DASHBOARD,
			position: 1,
			visible: true,
			label: t('label.dashboard', 'Dashboard'),
			primaryBar: 'HomeOutline',
			appView: AppView
		});
		addRoute({
			route: MONITORING,
			position: 2,
			visible: true,
			label: t('label.monitoring', 'Monitoring'),
			primaryBar: 'ActivityOutline',
			appView: AppView
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
			position: 2,
			visible: true,
			label: t('label.mail_stores', 'Mailstores'),
			primaryBar: 'HardDriveOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: StorageTooltipView
		});
		addRoute({
			route: COS_ROUTE_ID,
			position: 3,
			visible: true,
			label: t('label.cos', 'COS'),
			primaryBar: 'CosOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection },
			tooltip: CosTooltipView
		});
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
			route: PRIVACY_ROUTE_ID,
			position: 5,
			visible: true,
			label: t('label.privacy', 'Privacy'),
			primaryBar: 'ShieldOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...managementSection }
		});
		addRoute({
			route: BACKUP_ROUTE_ID,
			position: 1,
			visible: true,
			label: t('label.backup', 'Backup'),
			primaryBar: 'HistoryOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...servicesSection },
			tooltip: BackupTooltipView
		});

		addRoute({
			route: OPERATIONS,
			position: 1,
			visible: true,
			label: t('label.operations', 'Operations'),
			primaryBar: 'ListOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
		});

		addRoute({
			route: APPLICATION_LOG,
			position: 2,
			visible: true,
			label: t('label.application_log', 'Application Log'),
			primaryBar: 'FileTextOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
		});

		addRoute({
			route: MTA,
			position: 3,
			visible: true,
			label: t('label.mta', 'MTA'),
			primaryBar: 'MailFolderOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
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
		logAndQueuesSection
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
					Object.keys(backupServer[0]).forEach((ele: any): void => {
						const backup = backupServer[0][ele]?.ZxBackup;
						if (backup?.services?.module?.running) {
							setBackupModuleEnable(true);
						}
					});
				} else {
					setBackupModuleEnable(false);
				}
			});
		},
		[setBackupModuleEnable]
	);
	const getGlobalConfig = useCallback(
		(serverName) => {
			postSoapFetchRequest(`/service/admin/soap/zextras`, {
				zextras: {
					_jsns: 'urn:zimbraAdmin',
					module: 'ZxConfig',
					action: 'dump_global_config',
					targetServers: serverName
				}
			}).then((data: any) => {
				const responseData = JSON.parse(data?.Body?.response?.content);
				const globalConfig = responseData?.response[serverName]?.response;
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
				checkIsBackupModuleEnable(server);
				getGlobalConfig(server[0]?.name);
			}
		});
	}, [setServerList, getGlobalConfig, checkIsBackupModuleEnable]);

	useEffect(() => {
		getAllServersRequest();
	}, [getAllServersRequest]);

	const getAllConfigRequest = useCallback(() => {
		getAllConfig().then((data) => {
			if (data?.a && Array.isArray(data?.a)) {
				const allConfig = data?.a;
				setConfig(allConfig);
			}
		});
	}, [setConfig]);

	useEffect(() => {
		getAllConfigRequest();
	}, [getAllConfigRequest]);

	return null;
};

export default App;
