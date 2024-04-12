/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Row, Padding, Text } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import {
	ANTIVIRUS_AND_ANTISPAM,
	GENERAL,
	MTA_ROUTE_ID,
	OUTBOUND_FLOW,
	ADVANCED,
	POSTSCREEN_TUNING,
	QUEUE,
	IS_SERVER_SPECIFICS_EXPANDED,
	MTA_SERVER_GENERAL
} from '../../constants';
import MatomoTracker from '../../matomo-tracker';
import { useConfigStore } from '../../store/config/store';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useServerStore } from '../../store/server/store';
import DropDownInput from '../components/dropDownInput';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const MTAListPanel: FC = () => {
	const [t] = useTranslation();
	const { userId } = useConfigStore((state) => state);
	const matomo = useMemo(() => new MatomoTracker(userId), [userId]);
	const [isMtaSettingsExpanded, setIsMtaSettingsExpanded] = useState(true);
	const [selectedOperationItem, setSelectedOperationItem] = useState(GENERAL);
	const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState<boolean>(true);
	const [serverNames, setServerNames] = useState<any>();
	const mtaServerList = useServerStore((state) => state.mtaServerList);
	const [selectedServer, setSelectedServer] = useState<string>('');
	const [isServerSelect, setIsServerSelect] = useState<boolean>(false);
	const [searchServer, setSearchServer] = useState<string>('');
	const [isShowError, setIsShowError] = useState(false);

	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${MTA_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const toggleServerSpecific = (): void => {
		if (isServerSpecificsExpanded) {
			setIsServerSpecificsExpanded(false);
			localStorage.setItem(IS_SERVER_SPECIFICS_EXPANDED, 'false');
		} else {
			setIsServerSpecificsExpanded(true);
			localStorage.removeItem(IS_SERVER_SPECIFICS_EXPANDED);
		}
		setIsServerSpecificsExpanded(!isServerSpecificsExpanded);
	};

	const customIconDetail = {
		icon: searchServer === '' ? 'HardDriveOutline' : 'CloseOutline',
		onClick: (): void => {
			setIsShowError(false);
			if (searchServer !== '') {
				setSearchServer('');
				setIsServerSelect(false);
				setSelectedOperationItem(MTA_SERVER_GENERAL);
			}
		}
	};

	const addServerToList = useCallback((list: any) => {
		const data = list.map((serverItem: any) => ({
			id: serverItem?.id,
			label: serverItem?.name,
			customComponent: (
				<Row
					style={{
						display: 'block',
						textAlign: 'left',
						height: 'inherit',
						padding: '0.18rem',
						width: 'inherit'
					}}
					onClick={(): void => {
						setSelectedServer(serverItem?.name);
						setSearchServer(serverItem?.name);
						setSelectedOperationItem(MTA_SERVER_GENERAL);
						setIsServerSelect(true);
					}}
				>
					{serverItem?.name}
				</Row>
			)
		}));
		setServerNames(data);
	}, []);

	useEffect(() => {
		const filterList = mtaServerList.filter((item: any) => item.name.includes(searchServer));
		addServerToList(filterList);
		if (mtaServerList.length > 0 && filterList.length === 0) {
			setIsShowError(true);
		}
	}, [searchServer, addServerToList, mtaServerList]);

	const mailTransferAgentOptions = useMemo(
		() => [
			{
				id: GENERAL,
				name: t('mta.inbound_flow_and_security', 'Inbound Flow & Security'),
				isSelected: true
			},
			{
				id: POSTSCREEN_TUNING,
				name: t('mta.postscreen_tuning', 'Postscreen Tuning'),
				isSelected: true
			},
			{
				id: OUTBOUND_FLOW,
				name: t('mta.outbound_flow', 'Outbound Flow'),
				isSelected: true
			},
			{
				id: ANTIVIRUS_AND_ANTISPAM,
				name: t('mta.antivirus_and_antispam', 'Antivirus & Antispam'),
				isSelected: true
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
				isSelected: true
			},
			{
				id: QUEUE,
				name: t('mta.queue', 'Queue'),
				isSelected: true
			}
		],
		[t]
	);

	const serverOptions = useMemo(
		() => [
			{
				id: MTA_SERVER_GENERAL,
				name: t('label.mta_server_general', 'General'),
				isSelected: isServerSelect
			}
		],
		[t, isServerSelect]
	);

	const toggleDefaultSettingsView = (): void => {
		setIsMtaSettingsExpanded(!isMtaSettingsExpanded);
	};

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
		if (selectedOperationItem === MTA_SERVER_GENERAL) {
			replaceHistory(`/${selectedServer}/${selectedOperationItem}`);
		} else {
			replaceHistory(`/${selectedOperationItem}`);
		}
	}, [globalCarbonioSendAnalytics, matomo, selectedOperationItem, selectedServer]);

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

			<Container mainAlignment="flex-start">
				<ListPanelItem
					title={t('label.single_server', 'Single Server')}
					isListExpanded={isServerSpecificsExpanded}
					setToggleView={toggleServerSpecific}
				/>
				{isServerSpecificsExpanded && (
					<>
						<Row mainAlignment="flex-start" width="100%">
							<DropDownInput
								items={serverNames || []}
								maxWidth="18.75rem"
								width="16.56rem"
								inputLabel={t('label.select_a_server', 'Select a Server')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setIsShowError(false);
									setSearchServer(e.target.value);
								}}
								inputValue={searchServer}
								isCustomIcon
								hasError={isShowError}
								inputDisabled={false}
								customIconDetail={customIconDetail}
							/>
							{isShowError && (
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding top="large" left="small">
										<Text size="extrasmall" weight="regular" color="error">
											{t(
												'label.not_found_check_the_text_and_try_again',
												'Not found - check the text and try again'
											)}
										</Text>
									</Padding>
								</Container>
							)}
						</Row>
					</>
				)}

				{isServerSpecificsExpanded && (
					<ListItems
						items={serverOptions}
						selectedOperationItem={selectedOperationItem}
						setSelectedOperationItem={setSelectedOperationItem}
					/>
				)}
			</Container>
		</Container>
	);
};

export default MTAListPanel;
