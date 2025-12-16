/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { LOG_AND_QUEUES, NOTIFICATION_ROUTE_ID, PRIMARY_BAR_NOTIFICATIONS } from './constants';
import { Spinner } from './views/components/spinner';
import PrimaryBarTooltip from './views/primary-bar-tooltip/primary-bar-tooltip';

const LazyAppView = lazy(() => import('./views/app-view'));

const AppView: FC = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const App: FC = () => {
	const [t] = useTranslation();
	const isAdvanced = useIsAdvanced();

	const logAndQueuesSection = useMemo(
		() => ({
			id: LOG_AND_QUEUES,
			label: t('label.long_and_queues', 'Log & Queues'),
			position: 5
		}),
		[t]
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

	useEffect(() => {
		if (isAdvanced) {
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
		}
	}, [NotificationTooltipView, isAdvanced, logAndQueuesSection, t]);

	return null;
};

export default App;
