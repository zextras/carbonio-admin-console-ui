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
import { useTranslation } from 'react-i18next';
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
	OPERATIONS,
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
				header: t('label.backup', 'BACKUP'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.global_server_settings', 'Global Server Settings'),
				options: [
					{
						label: t('label.server_config', 'Server Config')
					},
					{
						label: t('label.advanced', 'Advanced')
					},
					{
						label: t('label.servers_list', 'Servers List')
					}
				]
			},
			{
				header: t('label.server_specifics', 'Server Specifics'),
				options: [
					{
						label: t('label.configuration_lbl', 'Configuration')
					},
					{
						label: t('label.advanced', 'Advanced')
					}
				]
			} /* ,
			{
				header: t('label.actions', 'Actions'),
				options: [
					{
						label: t('label.import_an_external_backup', 'Import an External Backup')
					}
				]
			} */
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
					} /* ,
					{
						label: t('label.retention_policy', 'Retention Policy')
					} */
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
				header: t('domain.manage', 'Manage'),
				options: [
					{
						label: t('label.accounts', 'Accounts')
					},
					{
						label: t('label.mailing_list', 'Mailing List')
					},
					{
						label: t('label.resources', 'Resources')
					},
					/* {
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
					} */
					{
						label: t('label.restore_account', 'Restore Account')
					}
					/* {
						label: t('label.restore_deleted_email', 'Restore Deleted E-mail')
					} */
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
				header: t('label.mailstores', 'Mailstores'),
				options: [
					{
						label: t('label.here_you_will_find', 'Here you will find')
					}
				]
			},
			{
				header: t('label.global_servers', 'Global Servers'),
				options: [
					{
						label: t('label.servers_list', 'Servers List')
					},
					{
						label: t('label.bucket_list', 'Bucket List')
					}
				]
			},
			{
				header: t('label.server_details', 'Server Details'),
				options: [
					{
						label: t('label.data_volumes', 'Data Volumes')
					}
					/* ,
					{
						label: t('label.hsm_policies', 'HSM Policies')
					},
					{
						label: t('label.indexer_settings', 'Indexer Settings')
					} */
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
					} /* ,
					{
						label: t('label.activate_and_update', 'Activate & Update')
					} */
				]
			}
		],
		[t]
	);

	const SubscriptionTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={subscriptionTooltipItems} />,
		[subscriptionTooltipItems]
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
			appView: AppView
		});
		addRoute({
			route: MONITORING,
			position: 2,
			visible: false,
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
			label: t('label.mailstores', 'Mailstores'),
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
			primarybarSection: { ...managementSection }
		});

		/* addRoute({
			route: OPERATIONS,
			position: 1,
			visible: true,
			label: t('label.operations', 'Operations'),
			primaryBar: 'ListOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
		}); */

		/* addRoute({
			route: APPLICATION_LOG,
			position: 2,
			visible: true,
			label: t('label.application_log', 'Application Log'),
			primaryBar: 'FileTextOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
		}); */

		/* addRoute({
			route: MTA,
			position: 3,
			visible: false,
			label: t('label.mta', 'MTA'),
			primaryBar: 'MailFolderOutline',
			appView: AppView,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			primarybarSection: { ...logAndQueuesSection }
		}); */

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
		isAdvanced
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
				setAllServersList(server);
				getGlobalConfig(server[0]?.name);
			}
		});
	}, [setServerList, checkIsBackupModuleEnable, setAllServersList, getGlobalConfig]);

	const getMailstoresServersRequest = useCallback(() => {
		getMailstoresServers().then((data) => {
			const server = data?.server;
			if (server && Array.isArray(server) && server.length > 0) {
				setVolumeList(server);
			}
		});
	}, [setVolumeList]);

	useEffect(() => {
		getAllServersRequest();
		// another call just to get only mailstores can be improvised later
		getMailstoresServersRequest();
	}, [getAllServersRequest, getMailstoresServersRequest]);

	return null;
};

export default App;
