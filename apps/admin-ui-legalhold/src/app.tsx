/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addRoute, removeRoute, useIsAdvanced, useHasAllRights } from '@zextras/admin-ui-bootstrap';
import React, { FC, lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { LEGAL_HOLD_ROUTE_ID, PRIMARY_BAR_LEGAL_HOLD, SERVICES_ROUTE_ID } from './constants';
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

	const hasAllConfigRights = useHasAllRights();

	const servicesSection = useMemo(
		() => ({
			id: SERVICES_ROUTE_ID,
			label: t('label.services', 'Services'),
			position: 4
		}),
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

	const LegalHoldTooltipView: FC = useCallback(
		() => <PrimaryBarTooltip items={leagalHoldTooltipItem} />,
		[leagalHoldTooltipItem]
	);

	useEffect(() => {
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
		}
	}, [LegalHoldTooltipView, hasAllConfigRights, isAdvanced, servicesSection, t]);

	return null;
};

export default App;
