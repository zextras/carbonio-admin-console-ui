/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { LIST, NOTIFICATION_ROUTE_ID } from '../../constants';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useConfigStore } from '../../store/config/store';

const NotificationsListPanel: FC = () => {
	const [t] = useTranslation();
	const { userId } = useConfigStore((state) => state);
	const matomo = useMemo(() => new MatomoTracker(userId), [userId]);
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
		globalCarbonioSendAnalytics && matomo.trackPageView(`${NOTIFICATION_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
		replaceHistory(`/${selectedOperationItem}`);
	}, [selectedOperationItem, globalCarbonioSendAnalytics, matomo]);

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
