/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useMemo, useRef } from 'react';

import { Container, Icon, Row, Padding, Text } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import GeneralListPanel from './general-list-panel';
import {
	GENERAL_INFORMATION,
	FEATURES,
	PREFERENCES,
	MAX_COS_DISPLAY,
	MANAGE_APP_ID,
	COS_ROUTE_ID,
	ADVANCED,
	SERVER_POOLS,
	COS,
	COS_LIST,
	CREATE_NEW_COS_ROUTE_ID
} from '../../constants';
import MatomoTracker from '../../matomo-tracker';
import { getCosList } from '../../services/search-cos-service';
import { useConfigStore } from '../../store/config/store';
import { useCosStore } from '../../store/cos/store';
import { useGlobalConfigStore } from '../../store/global-config/store';
import DropDownInput from '../components/dropDownInput';
import OverlayDivision from '../components/overlayDivision';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const ovelayStyle = styled(Container)`
	width: 20rem;
	right: 0;
	bottom: 0;
	height: 8rem;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
`;

const loadingComponent = [
	{
		customComponent: (
			<Container>
				<OverlayDivision ovelayStyle={ovelayStyle} />
			</Container>
		)
	}
];

const CosListPanel: FC = () => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [t] = useTranslation();
	const locationService = useLocation();
	const { userId } = useConfigStore((state) => state);
	const matomo = useMemo(() => new MatomoTracker(userId), [userId]);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [searchCosName, setSearchCosName] = useState('');
	const [isCosSelect, setIsCosSelect] = useState(false);
	const [cosList, setCosList] = useState([]);
	const [isCosListExpand, setIsCosListExpand] = useState(false);
	const { cosView, setCosView, cos } = useCosStore();
	const setCos = useCosStore((state) => state.setCos);
	const cosInformation = useCosStore((state) => state.cos);
	const cosName: any = useCosStore((state) => state.cos?.name);
	const [isShowError, setIsShowError] = useState(false);
	const prevCosRef = useRef();
	const [isLoading, setIsLoading] = useState(false);
	const [isDetailListExpanded, setIsDetailListExpanded] = useState(true);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${COS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const getCosLists = (searchData: string): any => {
		setIsLoading(true);
		getCosList(searchData).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setCosList(searchResponse?.cos);
				setIsLoading(false);
			} else {
				setCosList([]);
				setIsShowError(true);
				setIsLoading(false);
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
			setCosView(GENERAL_INFORMATION);
			if (cosInformation?.id) {
				setCos({ name: cosInformation?.name, id: cosInformation?.id });
			}
		}
	}, [cosInformation?.id, cosInformation?.name, setCos, setCosView]);

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
			setCosView('');
			setCos({});
		}
	}, [locationService, setCos, setCosView]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchCosCall = useCallback(
		debounce((searchData) => {
			getCosLists(searchData);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (!isCosSelect) {
			searchCosCall(searchCosName);
		}
	}, [searchCosName, isCosSelect, searchCosCall]);

	const toggleDetailView = (): void => {
		if (isDetailListExpanded) {
			setIsDetailListExpanded(false);
			localStorage.setItem('isCosDetailListExpanded', 'false');
		} else {
			setIsDetailListExpanded(true);
			localStorage.removeItem('isCosDetailListExpanded');
		}
		setIsDetailListExpanded(!isDetailListExpanded);
	};

	const selectedCos = useCallback(
		(cosData: any) => {
			setIsCosSelect(true);
			setSearchCosName(cosData?.name);
			setIsCosListExpand(false);
			setCos({
				a: cosData?.a,
				id: cosData?.id,
				name: cosData?.name
			});
			setCosView(GENERAL_INFORMATION);
		},
		[setCos, setCosView]
	);

	useEffect(() => {
		if (cosView === COS_LIST || cosView === '') {
			replaceHistory(`/${COS_LIST}`);
			setCosView(COS_LIST);
		} else if (cosView === CREATE_NEW_COS_ROUTE_ID) {
			replaceHistory(`/${cosView}`);
		} else if (isCosSelect && cos?.id) {
			if (cosView === COS) {
				replaceHistory(`/cos_list`);
			} else if (cosView) {
				globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${cosView}`);
				replaceHistory(`/${cos?.id}/${cosView}`);
			} else {
				globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${cosView}`);
				replaceHistory(`/${cos?.id}/${GENERAL_INFORMATION}`);
			}
		}
	}, [isCosSelect, cos, cosView, matomo, globalCarbonioSendAnalytics, setCosView]);

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

	const customIconDetail = {
		icon: isCosListExpand ? 'ArrowIosUpward' : 'ArrowIosDownwardOutline',
		onClick: (): void => {
			setIsCosListExpand(!isCosListExpand);
		},
		style: {
			width: '20px',
			height: '20px'
		}
	};

	const globalOptionItems = useMemo<
		{
			id: string;
			name: string;
		}[]
	>(
		() => [
			{
				id: COS_LIST,
				name: t('label.Cos_list', 'COS List'),
				isSelected: true
			}
		],
		[t]
	);

	const items =
		cosList.length > MAX_COS_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
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
			: cosList.map((cosData: any) => ({
					id: cosData.id,
					label: cosData.name,
					customComponent: (
						<SelectItem
							style={{
								display: 'block',
								textAlign: 'left',
								height: 'inherit',
								padding: '3px',
								width: 'inherit'
							}}
							onClick={(): void => {
								selectedCos(cosData);
							}}
						>
							{cosData?.name}
						</SelectItem>
					)
			  }));

	useEffect(() => {
		const storedValue = localStorage.getItem('isCosDetailListExpanded');
		if (storedValue === 'false') {
			setIsDetailListExpanded(false);
		} else {
			setIsDetailListExpanded(true);
		}
	}, []);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<GeneralListPanel generalOptionItems={globalOptionItems} />
			<Row padding={{ all: 'medium' }} width="100%" mainAlignment="space-between"></Row>
			<Row mainAlignment="flex-start" width="100%">
				<DropDownInput
					items={isLoading ? loadingComponent : items}
					inputLabel={
						isCosSelect
							? t('cos.i_want_to_see_this_cos', 'I want to see this COS')
							: t('cos.search_class_of_service', 'Select a Class of Service')
					}
					onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
						setIsCosSelect(false);
						setIsShowError(false);
						setSearchCosName(ev.target.value);
					}}
					inputValue={searchCosName}
					hasError={isShowError}
					isCustomIcon
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
			<ListPanelItem
				title={t('label.details', 'Details')}
				isListExpanded={isDetailListExpanded}
				setToggleView={toggleDetailView}
			/>
			{isDetailListExpanded && (
				<ListItems
					items={detailOptions}
					selectedOperationItem={cosView}
					setSelectedOperationItem={setCosView}
				/>
			)}
		</Container>
	);
};

export default CosListPanel;
