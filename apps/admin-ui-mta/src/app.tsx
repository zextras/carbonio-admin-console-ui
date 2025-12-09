/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useHasAllRights } from '@zextras/admin-ui-bootstrap';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MANAGE_APP_ID, MTA_ROUTE_ID, PRIMARY_BAR_MTA } from './constants';
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

	const hasAllConfigRights = useHasAllRights();

	const managementSection = useMemo(
		() => ({
			id: MANAGE_APP_ID,
			label: t('label.management', 'Management'),
			position: 3
		}),
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

	const MTATooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={mtaTooltipItem} />,
		[mtaTooltipItem]
	);

	useEffect(() => {
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
		} else {
			removeRoute(MTA_ROUTE_ID);
		}
	}, [MTATooltipView, hasAllConfigRights, managementSection, t]);

	return null;
};

export default App;
