/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import {
	DONE_ROUTE_ID,
	OPERATIONS_ROUTE_ID,
	QUEUED_ROUTE_ID,
	RUNNING_ROUTE_ID
} from '../../constants';
import ListItems from '../list/list-items';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';

const OperationsListPanel: FC = () => {
	const [t] = useTranslation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [selectedOperationItem, setSelectedOperationItem] = useState(RUNNING_ROUTE_ID);

	const manageOptions = useMemo(
		() => [
			{
				id: RUNNING_ROUTE_ID,
				name: t('label.running', 'Running'),
				isSelected: true
			},
			{
				id: QUEUED_ROUTE_ID,
				name: t('label.queued', 'Queued'),
				isSelected: true
			},
			{
				id: DONE_ROUTE_ID,
				name: t('label.done', 'Done'),
				isSelected: true
			}
		],
		[t]
	);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${OPERATIONS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		if (selectedOperationItem) {
			globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
			replaceHistory(`/${selectedOperationItem}`);
		}
	}, [selectedOperationItem, globalCarbonioSendAnalytics, matomo]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '0.0625rem solid #FFFFFF' }}
		>
			<ListItems
				items={manageOptions}
				selectedOperationItem={selectedOperationItem}
				setSelectedOperationItem={setSelectedOperationItem}
			/>
		</Container>
	);
};

export default OperationsListPanel;
