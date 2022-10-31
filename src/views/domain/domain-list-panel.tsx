/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useMemo } from 'react';
import {
	Container,
	Input,
	Icon,
	Row,
	Padding,
	Text,
	Dropdown
} from '@zextras/carbonio-design-system';

import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { getDomainList } from '../../services/search-domain-service';
import {
	ACCOUNTS,
	AUTHENTICATION,
	DOMAINS_ROUTE_ID,
	GAL,
	GENERAL_INFORMATION,
	GENERAL_SETTINGS,
	MAILBOX_QUOTA,
	MAILING_LIST,
	MANAGE_APP_ID,
	MAX_DOMAIN_DISPLAY,
	RESOURCES,
	RESTORE_ACCOUNT,
	RESTORE_DELETED_EMAIL,
	VIRTUAL_HOSTS
} from '../../constants';
import { useDomainStore } from '../../store/domain/store';
import ListPanelItem from '../list/list-panel-item';
import ListItems from '../list/list-items';
import { useBackupModuleStore } from '../../store/backup-module/store';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainListPanel: FC = () => {
	const [t] = useTranslation();
	const locationService = useLocation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [isDomainListExpand, setIsDomainListExpand] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainId, setDomainId] = useState('');
	const [domainList, setDomainList] = useState([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [selectedOperationItem, setSelectedOperationItem] = useState('');
	const setDomain = useDomainStore((state) => state.setDomain);
	const domainInformation = useDomainStore((state) => state.domain);
	const [isDetailListExpanded, setIsDetailListExpanded] = useState(true);
	const [isManageListExpanded, setIsManageListExpanded] = useState(true);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${DOMAINS_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const getBackupModuleEnable = useBackupModuleStore((state) => state.backupModuleEnable);
	const getDomainLists = (domainName: string): any => {
		getDomainList(domainName).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setDomainList(searchResponse?.domain);
			} else {
				setDomainList([]);
			}
		});
	};

	useEffect(() => {
		getDomainLists('');
	}, []);

	useEffect(() => {
		if (domainInformation?.name) {
			setSearchDomainName(domainInformation?.name);
			setIsDomainSelect(true);
			setIsDomainListExpand(false);
			setSelectedOperationItem(GENERAL_SETTINGS);
			if (domainInformation?.id) {
				setDomainId(domainInformation?.id);
			}
		}
	}, [domainInformation?.id, domainInformation?.name]);

	useEffect(() => {
		if (
			locationService.pathname &&
			locationService.pathname === `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`
		) {
			setDomainList([]);
			setIsDomainSelect(false);
			setSearchDomainName('');
			setIsDomainListExpand(false);
			setSelectedOperationItem('');
			setDomainId('');
			setDomain({});
		}
	}, [locationService, setDomain]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (searchDomainName && !isDomainSelect) {
			searchDomainCall(searchDomainName);
		}
	}, [searchDomainName, isDomainSelect, searchDomainCall]);

	const selectedDomain = useCallback((domain: any) => {
		setIsDomainSelect(true);
		setSearchDomainName(domain?.name);
		setIsDomainListExpand(false);
		setDomainId(domain?.id);
		setSelectedOperationItem(GENERAL_SETTINGS);
	}, []);

	useEffect(() => {
		if (isDomainSelect && domainId) {
			if (selectedOperationItem) {
				globalCarbonioSendAnalytics &&
					matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
				replaceHistory(`/${domainId}/${selectedOperationItem}`);
			} else {
				globalCarbonioSendAnalytics &&
					matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
				replaceHistory(`/${domainId}/${GENERAL_SETTINGS}`);
			}
		}
	}, [isDomainSelect, domainId, selectedOperationItem, matomo, globalCarbonioSendAnalytics]);

	const detailOptions = useMemo(
		() => [
			// {
			// 	id: GENERAL_INFORMATION,
			// 	name: t('label.general_information', 'General Information'),
			// 	isSelected: isDomainSelect
			// },
			{
				id: GENERAL_SETTINGS,
				name: t('label.general_settings', 'General Settings'),
				isSelected: isDomainSelect
			},
			{
				id: GAL,
				name: t('label.gal', 'GAL'),
				isSelected: isDomainSelect
			},
			{
				id: AUTHENTICATION,
				name: t('label.authentication', 'Authentication'),
				isSelected: isDomainSelect
			},
			{
				id: VIRTUAL_HOSTS,
				name: t('label.virtual_hosts', 'Virtual Hosts'),
				isSelected: isDomainSelect
			},
			{
				id: MAILBOX_QUOTA,
				name: t('label.mailbox_quota', 'Mailbox Quota'),
				isSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

	const allManageOptions = useMemo(
		() => [
			{
				id: ACCOUNTS,
				name: t('label.accounts', 'Accounts'),
				isSelected: isDomainSelect
			},
			{
				id: MAILING_LIST,
				name: t('label.mailing_list', 'Mailing List'),
				isSelected: isDomainSelect
			},
			{
				id: RESOURCES,
				name: t('label.resources', 'Resources'),
				isSelected: isDomainSelect
			},
			/* {
				id: ADMIN_DELEGATES,
				name: t('label.admin_delegates', 'Admin Delegates'),
				isSelected: isDomainSelect
			}, 
			{
				id: ACTIVE_SYNC,
				name: t('label.active_sync', 'ActiveSync'),
				isSelected: isDomainSelect
			},
			{
				id: ACCOUNT_SCAN,
				name: t('label.account_scan', 'AccountScan'),
				isSelected: isDomainSelect
			},
			{
				id: EXPORT_DOMAIN,
				name: t('label.export_domain', 'Export Domain'),
				isSelected: isDomainSelect
			}, */
			{
				id: RESTORE_ACCOUNT,
				name: t('label.restore_account', 'Restore Account'),
				isSelected: isDomainSelect
			}
			/* {
				id: RESTORE_DELETED_EMAIL,
				name: t('label.restore_deleted_email', 'Restore Deleted E-mail'),
				isSelected: isDomainSelect
			} */
		],
		[t, isDomainSelect]
	);

	const manageOptions = useMemo(
		() =>
			!getBackupModuleEnable
				? allManageOptions.filter((item: any) => item?.id !== RESTORE_DELETED_EMAIL)
				: allManageOptions,
		[getBackupModuleEnable, allManageOptions]
	);

	const toggleDetailView = (): void => {
		setIsDetailListExpanded(!isDetailListExpanded);
	};

	const toggleManageView = (): void => {
		setIsManageListExpanded(!isManageListExpanded);
	};

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
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
											'many_domain_info_msg',
											'So many domains! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: domainList.map((domain: any, index) => ({
					id: domain.id,
					label: domain.name,
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
								selectedDomain(domain);
							}}
						>
							{domain?.name}
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
							isDomainSelect
								? t('domain.i_want_to_see_this_domain', 'I want to see this domain')
								: t('domain.type_here_a_domain', 'Type here a domain')
						}
						onChange={(ev: any): void => {
							setSearchDomainName(ev.target.value);
						}}
						CustomIcon={(): any => (
							<CustomIcon
								icon="GlobeOutline"
								size="large"
								color="text"
								onClick={(): void => {
									setIsDomainListExpand(!isDomainListExpand);
								}}
							/>
						)}
						value={searchDomainName}
						backgroundColor="gray5"
					/>
				</Dropdown>
			</Row>
			<ListPanelItem
				title={t('label.details', 'Details')}
				isListExpanded={isDetailListExpanded}
				setToggleView={toggleDetailView}
			/>
			{isDetailListExpanded && (
				<ListItems
					items={detailOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
			<ListPanelItem
				title={t('domain.manage', 'Manage')}
				isListExpanded={isManageListExpanded}
				setToggleView={toggleManageView}
			/>
			{isManageListExpanded && (
				<ListItems
					items={manageOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
		</Container>
	);
};
export default DomainListPanel;
