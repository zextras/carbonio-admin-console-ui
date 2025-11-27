/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	removeRoute,
	useAllConfig,
	useIsAdvanced,
	useUserAccounts,
	useHasRight,
	getRights,
	useCurrentUserRights,
	useMailstoreServers,
	useGlobalConfigStore,
	useAppConfigStore,
	useAllServers,
	useBucketServersListStore,
	useGlobalSettings
} from '@zextras/admin-ui-bootstrap';
import { Button } from '@zextras/carbonio-design-system';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import {
	BACKUP_ROUTE_ID,
	CARBONIO_SEND_ANALYTICS,
	LEGAL_HOLD_ROUTE_ID,
	LIST_SERVER,
	LOG_AND_QUEUES,
	MANAGE_APP_ID,
	MTA_ROUTE_ID,
	NOTIFICATION_ROUTE_ID,
	OPERATIONS_ROUTE_ID,
	PRIMARY_BAR_BACKUP,
	PRIMARY_BAR_LEGAL_HOLD,
	PRIMARY_BAR_MTA,
	PRIMARY_BAR_NOTIFICATIONS,
	PRIMARY_BAR_OPERATIONS,
	PRIMARY_BAR_PRIVACY,
	PRIMARY_BAR_STORAGE,
	PRIVACY_ROUTE_ID,
	SERVER,
	SERVICES_ROUTE_ID,
	STORAGES_ROUTE_ID,
	TRUE,
	CONFIG
} from './constants';
import SvgBackupOutline from './icons/outline/BackupOutline';
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

const PrimaryBarIconButton = styled(Button)`
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
	const { data: serverList = [] } = useAllServers();
	const setGlobalConfig = useGlobalConfigStore((state) => state.setGlobalConfig);
	const allConfig = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const { data: globalSettings } = useGlobalSettings({
		enabled: isAdvanced
	});
	const { setAllServersList, setVolumeList } = useBucketServersListStore((state) => state);
	const { config, setConfig, setUserId } = useAppConfigStore((state) => state);
	const setGlobalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.setGlobalCarbonioSendAnalytics
	);
	const accounts = useUserAccounts();
	const { data: rights } = useCurrentUserRights();
	const userName = accounts?.[0]?.name || '';
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);
	const { data: hasAllConfigRights = false } = useHasRight({
		userName,
		rightType: CONFIG,
		enabled: Boolean(userName)
	});
	const { data: mailstoreServers } = useMailstoreServers();

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
		setConfigRightsRoute();

		if (isAdvanced) {
			if (hasAllConfigRights) {
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
		LegalHoldTooltipView,
		NotificationTooltipView,
		OperationTooltipView,
		hasAllConfigRights,
		isAdvanced,
		logAndQueuesSection,
		managementSection,
		servicesSection,
		setConfigRightsRoute,
		t
	]);

	// Handle server list changes
	useEffect(() => {
		if (serverList && serverList.length > 0) {
			setAllServersList(serverList);
		}
	}, [serverList, setAllServersList]);

	useEffect(() => {
		if (globalSettings) {
			setGlobalConfig(globalSettings);
		}
	}, [globalSettings, setGlobalConfig]);

	return null;
};

export default App;
