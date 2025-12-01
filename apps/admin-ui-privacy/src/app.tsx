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
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	CARBONIO_SEND_ANALYTICS,
	MANAGE_APP_ID,
	PRIMARY_BAR_PRIVACY,
	PRIVACY_ROUTE_ID,
	TRUE
} from './constants';
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

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
		[t]
	);

	useEffect(() => {
		if (hasAllConfigRights) {
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
			removeRoute(PRIVACY_ROUTE_ID);
		}
	}, [PrivacyTooltipView, hasAllConfigRights, managementSection, t]);

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
