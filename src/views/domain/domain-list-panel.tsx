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
	ACCOUNT_SCAN,
	ACTIVE_SYNC,
	ADMIN_DELEGATES,
	AUTHENTICATION,
	DOMAINS_ROUTE_ID,
	DOMAIN_DETAIL_VIEW,
	DOMAIN_MANAGE_VIEW,
	EXPORT_DOMAIN,
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
import DomainListItems from './domain-list-items';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainListPanel: FC = () => {
	const [t] = useTranslation();
	const locationService = useLocation();
	const [isDomainListExpand, setIsDomainListExpand] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainId, setDomainId] = useState('');
	const [domainList, setDomainList] = useState([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [selectedDetailOperationItem, setSelectedDetailOperationItem] = useState('');
	const [selectedManageOperationItem, setSelectedManageOperationItem] = useState('');
	const domainView = useDomainStore((state) => state.domainView);
	const setDomain = useDomainStore((state) => state.setDomain);
	const domainInformation = useDomainStore((state) => state.domain);

	const getDomainLists = (domainName: string): any => {
		getDomainList(domainName)
			.then((response) => response.json())
			.then((data) => {
				const searchResponse: any = data?.Body?.SearchDirectoryResponse;
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
			setSelectedDetailOperationItem(GENERAL_SETTINGS);
			setSelectedManageOperationItem(ACCOUNTS);
			if (domainInformation?.id) {
				setDomainId(domainInformation?.id);
			}
		}
	}, [domainInformation]);

	useEffect(() => {
		if (
			locationService.pathname &&
			locationService.pathname === `/${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`
		) {
			setDomainList([]);
			setIsDomainSelect(false);
			setSearchDomainName('');
			setIsDomainListExpand(false);
			setSelectedDetailOperationItem('');
			setSelectedManageOperationItem('');
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
		setSelectedDetailOperationItem(GENERAL_SETTINGS);
		setSelectedManageOperationItem(ACCOUNTS);
	}, []);

	useEffect(() => {
		if (isDomainSelect && domainId) {
			if (domainView === DOMAIN_DETAIL_VIEW) {
				if (selectedDetailOperationItem) {
					replaceHistory(`${DOMAINS_ROUTE_ID}/${domainId}/${selectedDetailOperationItem}`);
				} else {
					replaceHistory(`${DOMAINS_ROUTE_ID}/${domainId}/${GENERAL_SETTINGS}`);
				}
			}
			if (domainView === DOMAIN_MANAGE_VIEW) {
				if (selectedManageOperationItem) {
					replaceHistory(`${DOMAINS_ROUTE_ID}/${domainId}/${selectedManageOperationItem}`);
				} else {
					replaceHistory(`${DOMAINS_ROUTE_ID}/${domainId}/${ACCOUNTS}`);
				}
			}
		}
	}, [
		isDomainSelect,
		domainId,
		domainView,
		selectedDetailOperationItem,
		selectedManageOperationItem
	]);

	const detailOptions = useMemo(
		() => [
			{
				id: GENERAL_INFORMATION,
				name: t('domain.general_information', 'General Information'),
				domainSelected: isDomainSelect
			},
			{
				id: GENERAL_SETTINGS,
				name: t('domain.general_settings', 'General Settings'),
				domainSelected: isDomainSelect
			},
			{
				id: GAL,
				name: t('domain.gal', 'GAL'),
				domainSelected: isDomainSelect
			},
			{
				id: AUTHENTICATION,
				name: t('domain.authentication', 'Authentication'),
				domainSelected: isDomainSelect
			},
			{
				id: VIRTUAL_HOSTS,
				name: t('domain.virtual_hosts', 'Virtual Hosts'),
				domainSelected: isDomainSelect
			},
			{
				id: MAILBOX_QUOTA,
				name: t('domain.mailbox_quota', 'Mailbox Quota'),
				domainSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

	const manageOptions = useMemo(
		() => [
			{
				id: ACCOUNTS,
				name: t('domain.accounts', 'Accounts'),
				domainSelected: isDomainSelect
			},
			{
				id: MAILING_LIST,
				name: t('domain.mailing_list', 'Mailing List'),
				domainSelected: isDomainSelect
			},
			{
				id: RESOURCES,
				name: t('domain.resources', 'Resources'),
				domainSelected: isDomainSelect
			},
			{
				id: ADMIN_DELEGATES,
				name: t('domain.admin_delegates', 'Admin Delegates'),
				domainSelected: isDomainSelect
			},
			{
				id: ACTIVE_SYNC,
				name: t('domain.active_sync', 'ActiveSync'),
				domainSelected: isDomainSelect
			},
			{
				id: ACCOUNT_SCAN,
				name: t('domain.account_scan', 'AccountScan'),
				domainSelected: isDomainSelect
			},
			{
				id: EXPORT_DOMAIN,
				name: t('domain.export_domain', 'Export Domain'),
				domainSelected: isDomainSelect
			},
			{
				id: RESTORE_ACCOUNT,
				name: t('domain.restore_account', 'Restore Account'),
				domainSelected: isDomainSelect
			},
			{
				id: RESTORE_DELETED_EMAIL,
				name: t('domain.restore_deleted_email', 'Restore Deleted E-mail'),
				domainSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

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
					customComponent: (
						<SelectItem
							top="9px"
							right="large"
							bottom="9px"
							left="large"
							style={{
								'font-family': 'roboto',
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
		<Container orientation="column" crossAlignment="flex-start" mainAlignment="flex-start">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Dropdown
					items={items}
					placement="bottom-start"
					maxWidth="300px"
					disableAutoFocus="true"
					width="21%"
					style={{
						width: '100%'
					}}
				>
					<Input
						label={t('domain.search_domain', 'Search a domain')}
						onChange={(ev: any): void => {
							setIsDomainSelect(false);
							setSearchDomainName(ev.target.value);
						}}
						CustomIcon={(): any => (
							<Icon
								icon={isDomainListExpand ? 'ArrowIosUpward' : 'ArrowIosDownwardOutline'}
								size="medium"
								color="primary"
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
			<DomainListItems
				items={domainView === DOMAIN_DETAIL_VIEW ? detailOptions : manageOptions}
				selectedOperationItem={
					domainView === DOMAIN_DETAIL_VIEW
						? selectedDetailOperationItem
						: selectedManageOperationItem
				}
				setSelectedOperationItem={
					domainView === DOMAIN_DETAIL_VIEW
						? setSelectedDetailOperationItem
						: setSelectedManageOperationItem
				}
			/>
		</Container>
	);
};
export default DomainListPanel;
