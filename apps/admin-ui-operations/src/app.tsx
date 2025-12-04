/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	addRoute,
	useAllConfig,
	useIsAdvanced,
	useGlobalConfigStore,
	useGlobalSettings
} from '@zextras/admin-ui-bootstrap';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	CARBONIO_SEND_ANALYTICS,
	LOG_AND_QUEUES,
	OPERATIONS_ROUTE_ID,
	PRIMARY_BAR_OPERATIONS,
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
	const { setGlobalConfig, setGlobalCarbonioSendAnalytics } = useGlobalConfigStore();
	const { data: allConfig = [] } = useAllConfig();
	const isAdvanced = useIsAdvanced();
	const { data: globalSettings } = useGlobalSettings({
		enabled: isAdvanced
	});

	useEffect(() => {
		const sendAnalytics = allConfig.filter(
			(items: { n: string }) => items.n === CARBONIO_SEND_ANALYTICS
		)[0]?._content;
		sendAnalytics === TRUE
			? setGlobalCarbonioSendAnalytics(true)
			: setGlobalCarbonioSendAnalytics(false);
	}, [allConfig, setGlobalCarbonioSendAnalytics]);

	const logAndQueuesSection = useMemo(
		() => ({
			id: LOG_AND_QUEUES,
			label: t('label.long_and_queues', 'Log & Queues'),
			position: 5
		}),
		[t]
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

	const OperationTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={operationTooltipItem} />,
		[operationTooltipItem]
	);

	useEffect(() => {
		if (isAdvanced) {
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
	}, [OperationTooltipView, isAdvanced, logAndQueuesSection, t]);

	// Handle server list changes
	useEffect(() => {
		if (globalSettings) {
			setGlobalConfig(globalSettings);
		}
	}, [globalSettings, setGlobalConfig]);

	return null;
};

export default App;
