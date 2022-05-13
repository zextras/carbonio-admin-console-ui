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
	List,
	Divider,
	Text,
	Dropdown
} from '@zextras/carbonio-design-system';

import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { debounce } from 'lodash';
import { getDomainList } from '../../services/search-domain-service';
import {
	ADVANCED,
	AUTHENTICATION,
	FREE_BUSY,
	GAL,
	GENERAL_INFORMATION,
	GENERAL_SETTINGS,
	MAILBOX_QUOTA,
	MAX_DOMAIN_DISPLAY,
	THEME,
	VIRTUAL_HOSTS
} from '../../constants';

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
	const [domainList, setDomainList] = useState([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [selectedOperationItem, setSelectedOperationItem] = useState('');
	const [domainItem, setDomainItem] = useState<any>({});

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
		if (locationService.pathname && locationService.pathname === '/manage/domain') {
			setDomainList([]);
			setIsDomainSelect(false);
			setSearchDomainName('');
			setIsDomainListExpand(false);
			setSelectedOperationItem('');
			setDomainItem({});
		}
	}, [locationService]);

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
		replaceHistory(`domain/${domain?.id}/${GENERAL_SETTINGS}`);
		setSelectedOperationItem(GENERAL_SETTINGS);
		setDomainItem(domain);
	}, []);

	const options = useMemo(
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
				id: ADVANCED,
				name: t('domain.advanced', 'Advanced'),
				domainSelected: isDomainSelect
			},
			{
				id: FREE_BUSY,
				name: t('domain.free_busy', 'Free/Busy'),
				domainSelected: isDomainSelect
			},
			{
				id: MAILBOX_QUOTA,
				name: t('domain.mailbox_quota', 'Mailbox Quota'),
				domainSelected: isDomainSelect
			},
			{
				id: THEME,
				name: t('domain.theme', 'Theme'),
				domainSelected: isDomainSelect
			}
		],
		[t, isDomainSelect]
	);

	const selectDomainOption = useCallback(
		(item) => () => {
			if (item?.domainSelected && item?.id !== GENERAL_INFORMATION) {
				replaceHistory(`domain/${domainItem?.id}/${item?.id}`);
				setSelectedOperationItem(item?.id);
			}
		},
		[domainItem]
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

	const ListItem: FC<{
		visible: any;
		active: boolean;
		item: any;
		selected: boolean;
		selecting: any;
		background: any;
		selectedBackground: any;
		activeBackground: any;
	}> = ({
		visible,
		active,
		item,
		selected,
		selecting,
		background,
		selectedBackground,
		activeBackground
	}) => (
		<Container
			height={55}
			orientation="vertical"
			mainAlignment="flex-start"
			width="100%"
			onClick={selectDomainOption(item)}
		>
			<Container padding={{ all: 'small' }} orientation="horizontal" mainAlignment="flex-start">
				<Padding horizontal="small">
					<Text
						color={item?.domainSelected ? '#414141' : 'rgba(204, 204, 204, 1)'}
						weight={item?.id === selectedOperationItem ? 'bold' : 'regular'}
					>
						{item.name}
					</Text>
				</Padding>
			</Container>
			<Divider />
		</Container>
	);

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
			<Container crossAlignment="flex-start" mainAlignment="flex-start">
				<List
					items={options}
					ItemComponent={ListItem}
					activeBackground="highlight"
					active={selectedOperationItem}
					selectedBackground="highlight"
				/>
			</Container>
		</Container>
	);
};
export default DomainListPanel;
