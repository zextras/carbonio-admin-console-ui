/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceHistory, useGlobalConfigStore } from '@zextras/admin-ui-bootstrap';
import { Container } from '@zextras/carbonio-design-system';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DONE_ROUTE_ID, QUEUED_ROUTE_ID, RUNNING_ROUTE_ID } from '../../constants';
import ListItems from '../list/list-items';

const OperationsListPanel: FC = () => {
	const [t] = useTranslation();
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
		if (selectedOperationItem) {
			replaceHistory(`/${selectedOperationItem}`);
		}
	}, [selectedOperationItem, globalCarbonioSendAnalytics]);

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
