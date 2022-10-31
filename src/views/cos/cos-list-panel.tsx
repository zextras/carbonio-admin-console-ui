/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useMemo, useRef, useContext } from 'react';
import {
	Container,
	Input,
	Icon,
	Row,
	Dropdown,
	Padding,
	Text
} from '@zextras/carbonio-design-system';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { debounce } from 'lodash';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useLocation } from 'react-router-dom';
import {
	GENERAL_INFORMATION,
	FEATURES,
	PREFERENCES,
	MAX_COS_DISPLAY,
	MANAGE_APP_ID,
	COS_ROUTE_ID,
	RETENTION_POLICY,
	ADVANCED,
	SERVER_POOLS
} from '../../constants';
import { getCosList } from '../../services/search-cos-service';
import { useCosStore } from '../../store/cos/store';
import ListItems from '../list/list-items';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const CosListPanel: FC = () => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [t] = useTranslation();
	const locationService = useLocation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [searchCosName, setSearchCosName] = useState('');
	const [cosId, setCosId] = useState('');
	const [isCosSelect, setIsCosSelect] = useState(false);
	const [cosList, setCosList] = useState([]);
	const [isCosListExpand, setIsCosListExpand] = useState(false);
	const [selectedOperationItem, setSelectedOperationItem] = useState('');
	const setCos = useCosStore((state) => state.setCos);
	const cosInformation = useCosStore((state) => state.cos);
	const cosName: any = useCosStore((state) => state.cos?.name);
	const prevCosRef = useRef();

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${COS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const getCosLists = (cos: string): any => {
		getCosList(cos).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setCosList(searchResponse?.cos);
			} else {
				setCosList([]);
			}
		});
	};

	useEffect(() => {
		getCosLists('');
	}, []);

	useEffect(() => {
		if (!!prevCosRef.current && prevCosRef.current !== cosName) {
			getCosLists('');
		}
		prevCosRef.current = cosName;
	}, [cosName]);

	useEffect(() => {
		if (cosInformation?.name) {
			setSearchCosName(cosInformation?.name);
			setIsCosSelect(true);
			setIsCosListExpand(false);
			setSelectedOperationItem(GENERAL_INFORMATION);
			if (cosInformation?.id) {
				setCosId(cosInformation?.id);
			}
		}
	}, [cosInformation?.id, cosInformation?.name]);

	useEffect(() => {
		if (
			(locationService.pathname &&
				locationService.pathname === `/${MANAGE_APP_ID}/${COS_ROUTE_ID}`) ||
			locationService.pathname === `/${MANAGE_APP_ID}/${COS_ROUTE_ID}/`
		) {
			setCosList([]);
			setIsCosSelect(false);
			setSearchCosName('');
			setIsCosListExpand(false);
			setSelectedOperationItem('');
			setCosId('');
			setCos({});
		}
	}, [locationService, setCos]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchCosCall = useCallback(
		debounce((cos) => {
			getCosLists(cos);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (searchCosName && !isCosSelect) {
			searchCosCall(searchCosName);
		}
	}, [searchCosName, isCosSelect, searchCosCall]);

	const selectedCos = useCallback((cos: any) => {
		setIsCosSelect(true);
		setSearchCosName(cos?.name);
		setIsCosListExpand(false);
		setCosId(cos?.id);
		setSelectedOperationItem(GENERAL_INFORMATION);
	}, []);

	useEffect(() => {
		if (isCosSelect && cosId) {
			if (selectedOperationItem) {
				globalCarbonioSendAnalytics &&
					matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
				replaceHistory(`/${cosId}/${selectedOperationItem}`);
			} else {
				globalCarbonioSendAnalytics &&
					matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
				replaceHistory(`/${cosId}/${GENERAL_INFORMATION}`);
			}
		}
	}, [isCosSelect, cosId, selectedOperationItem, matomo, globalCarbonioSendAnalytics]);

	const detailOptions = useMemo<
		{
			id: string;
			name: string;
		}[]
	>(
		() => [
			{
				id: GENERAL_INFORMATION,
				name: t('label.general_information', 'General Information'),
				isSelected: isCosSelect
			},
			{
				id: FEATURES,
				name: t('label.features', 'Features'),
				isSelected: isCosSelect
			},
			{
				id: PREFERENCES,
				name: t('label.preferences', 'Preferences'),
				isSelected: isCosSelect
			},
			{
				id: SERVER_POOLS,
				name: t('label.server_pools', 'Server Pools'),
				isSelected: isCosSelect
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
				isSelected: isCosSelect
			}
		],
		[t, isCosSelect]
	);

	const items =
		cosList.length > MAX_COS_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row takeAvwidth="fill" mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									takeAvwidth="fill"
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'many_cos_info_msg',
											'So many COSes! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: cosList.map((cos: any, index) => ({
					id: cos.id,
					label: cos.name,
					customComponent: (
						<SelectItem
							top="9px"
							right="large"
							bottom="9px"
							left="large"
							style={{
								fontFamily: 'roboto',
								display: 'block',
								textAlign: 'left',
								height: 'inherit',
								padding: '3px',
								width: 'inherit'
							}}
							onClick={(): void => {
								selectedCos(cos);
							}}
						>
							{cos?.name}
						</SelectItem>
					)
			  }));

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Dropdown
					items={items}
					placement="bottom-start"
					maxWidth="300px"
					disableAutoFocus
					width="265px"
					style={{
						width: '100%'
					}}
				>
					<Input
						label={
							isCosSelect
								? t('cos.i_want_to_see_this_cos', 'I want to see this COS')
								: t('cos.search_class_of_service', 'Select a Class of Service')
						}
						onChange={(ev: any): void => {
							setIsCosSelect(false);
							setSearchCosName(ev.target.value);
						}}
						CustomIcon={(): any => (
							<CustomIcon
								icon={isCosListExpand ? 'ArrowIosUpward' : 'ArrowIosDownwardOutline'}
								size="large"
								color="text"
								onClick={(): void => {
									setIsCosListExpand(!isCosListExpand);
								}}
							/>
						)}
						value={searchCosName}
						backgroundColor="gray5"
					/>
				</Dropdown>
			</Row>
			<Row
				padding={{ all: 'medium' }}
				takeAvwidth="fill"
				width="100%"
				mainAlignment="space-between"
			></Row>
			<ListItems
				items={detailOptions}
				selectedOperationItem={selectedOperationItem}
				setSelectedOperationItem={setSelectedOperationItem}
			/>
		</Container>
	);
};

export default CosListPanel;
