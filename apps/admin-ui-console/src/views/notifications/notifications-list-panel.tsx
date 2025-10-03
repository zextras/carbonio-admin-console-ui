/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/admin-ui-bootstrap';
import { useTranslation } from 'react-i18next';

import { LIST } from '../../constants';
import { useGlobalConfigStore } from '../../store/global-config/store';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const NotificationsListPanel: FC = () => {
	const [t] = useTranslation();
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [selectedOperationItem, setSelectedOperationItem] = useState(LIST);
	const [isManageOptionsExpanded, setIsManageOptionsExpanded] = useState<boolean>(true);

	const manageOptions = useMemo(
		() => [
			{
				id: LIST,
				name: t('notification.list', 'List'),
				isSelected: true
			}
		],
		[t]
	);

	const toggleManageSpecificOption = (): void => {
		setIsManageOptionsExpanded(!isManageOptionsExpanded);
	};

	useEffect(() => {
		replaceHistory(`/${selectedOperationItem}`);
	}, [selectedOperationItem, globalCarbonioSendAnalytics]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<ListPanelItem
				title={t('notification.manage', 'Manage')}
				isListExpanded={isManageOptionsExpanded}
				setToggleView={toggleManageSpecificOption}
			/>
			{isManageOptionsExpanded && (
				<ListItems
					items={manageOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
		</Container>
	);
};

export default NotificationsListPanel;
