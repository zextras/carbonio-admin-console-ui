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
	useMailstoreServers,
	useGlobalConfigStore,
	useAllServers,
	useBucketServersListStore,
	useGlobalSettings,
	useHasAllRights
} from '@zextras/admin-ui-bootstrap';
import { Button } from '@zextras/carbonio-design-system';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import {
	BACKUP_ROUTE_ID,
	CARBONIO_SEND_ANALYTICS,
	PRIMARY_BAR_BACKUP,
	SERVICES_ROUTE_ID,
	TRUE
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
	const { setGlobalConfig, setGlobalCarbonioSendAnalytics } = useGlobalConfigStore();
	const { data: allConfig = [] } = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const { data: globalSettings } = useGlobalSettings({
		enabled: isAdvanced
	});
	const { setAllServersList, setVolumeList } = useBucketServersListStore((state) => state);
	const hasAllConfigRights = useHasAllRights();
	const { data: mailstoreServers } = useMailstoreServers();

	useEffect(() => {
		const sendAnalytics = allConfig.filter(
			(items: { n: string }) => items.n === CARBONIO_SEND_ANALYTICS
		)[0]?._content;
		sendAnalytics === TRUE
			? setGlobalCarbonioSendAnalytics(true)
			: setGlobalCarbonioSendAnalytics(false);
	}, [allConfig, setGlobalCarbonioSendAnalytics]);

	useEffect(() => {
		if (mailstoreServers && mailstoreServers.length > 0) {
			setVolumeList(mailstoreServers);
		}
	}, [mailstoreServers, setVolumeList]);

	const servicesSection = useMemo(
		() => ({
			id: SERVICES_ROUTE_ID,
			label: t('label.services', 'Services'),
			position: 4
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

	useEffect(() => {
		if (hasAllConfigRights) {
			if (isAdvanced) {
				addRoute({
					route: BACKUP_ROUTE_ID,
					position: 1,
					visible: true,
					label: t('label.backup', 'Backup') || '',
					primaryBar: backupPrimaryBar,
					appView: AppView,
					primarybarSection: { ...servicesSection },
					tooltip: BackupTooltipView,
					trackerLabel: PRIMARY_BAR_BACKUP
				});
			}
		} else {
			removeRoute(BACKUP_ROUTE_ID);
		}
	}, [BackupTooltipView, backupPrimaryBar, hasAllConfigRights, isAdvanced, servicesSection, t]);

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
