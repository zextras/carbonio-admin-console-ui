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
	useMailstoreServers,
	useGlobalConfigStore,
	useAppConfigStore,
	useAllServers,
	useBucketServersListStore,
	useGlobalSettings
} from '@zextras/admin-ui-bootstrap';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	CARBONIO_SEND_ANALYTICS,
	MANAGE_APP_ID,
	PRIMARY_BAR_SUBSCRIPTIONS,
	SUBSCRIPTIONS_ROUTE_ID,
	TRUE,
	CONFIG
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
	const userName = accounts?.[0]?.name || '';
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

	useEffect(() => {
		if (isAdvanced && hasAllConfigRights) {
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
		} else {
			removeRoute(SUBSCRIPTIONS_ROUTE_ID);
		}
	}, [SubscriptionTooltipView, hasAllConfigRights, isAdvanced, managementSection, t]);

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
