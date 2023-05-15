/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GENERAL, MTA_ROUTE_ID, OUTBOUND_FLOW, POSTSCREEN_TUNING } from '../../constants';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const MTAListPanel: FC = () => {
	const [t] = useTranslation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const [isMtaSettingsExpanded, setIsMtaSettingsExpanded] = useState(true);
	const [selectedOperationItem, setSelectedOperationItem] = useState(GENERAL);

	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${MTA_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const mailTransferAgentOptions = useMemo(
		() => [
			{
				id: GENERAL,
				name: t('mta.inbound_flow_and_security', 'Inbound Flow & Security'),
				isSelected: true
			},
			{
				id: OUTBOUND_FLOW,
				name: t('mta.outbound_flow', 'Outbound Flow'),
				isSelected: true
			}
		],
		[t]
	);

	const toggleDefaultSettingsView = (): void => {
		setIsMtaSettingsExpanded(!isMtaSettingsExpanded);
	};

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
		replaceHistory(`/${selectedOperationItem}`);
	}, [globalCarbonioSendAnalytics, matomo, selectedOperationItem]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<ListPanelItem
				title={t('mta.mail_transfer_agent_mta', 'Mail Transfer Agent (MTA)')}
				isListExpanded={isMtaSettingsExpanded}
				setToggleView={toggleDefaultSettingsView}
			/>
			{isMtaSettingsExpanded && (
				<ListItems
					items={mailTransferAgentOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
		</Container>
	);
};

export default MTAListPanel;
