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
	Text
} from '@zextras/carbonio-design-system';

import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getDomainList } from '../../services/search-domain-service';
import { MAX_DOMAIN_DISPLAY } from '../../constants';

const SelectItem = styled(Row)`
	cursor: pointer;
	width: 100%;
	&:hover {
		background: ${({ theme }): any => theme.palette.highlight.regular};
	}
`;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DomainLists: FC<{ domainList: any; selectedDomain: any; t: any }> = ({
	domainList,
	selectedDomain,
	t
}) => (
	<Container
		orientation="column"
		crossAlignment="flex-start"
		mainAlignment="flex-start"
		width="100%"
		maxHeight="200px"
		style={{
			overflowY: 'auto'
		}}
		background="gray5"
	>
		{domainList.length <= MAX_DOMAIN_DISPLAY ? (
			domainList.map((item: any, i: number) => (
				<SelectItem
					takeAvwidth="fill"
					mainAlignment="flex-start"
					key={i}
					height="50px"
					onClick={(): void => {
						selectedDomain(item);
					}}
				>
					<Padding
						top="9px"
						right="large"
						bottom="9px"
						left="large"
						style={{
							'font-family': 'roboto'
						}}
					>
						{item?.name}
					</Padding>
				</SelectItem>
			))
		) : (
			<Container
				orientation="horizontal"
				width="fill"
				crossAlignment="center"
				mainAlignment="space-between"
				background="gray5"
				padding={{
					all: 'small'
				}}
			>
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
			</Container>
		)}
	</Container>
);

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
	<Container height={55} orientation="vertical" mainAlignment="flex-start" width="100%">
		<Container padding={{ all: 'small' }} orientation="horizontal" mainAlignment="flex-start">
			<Padding horizontal="small">
				<Text color="rgba(204, 204, 204, 1)">{item.name}</Text>
			</Padding>
		</Container>
		<Divider />
	</Container>
);

const DomainListPanel: FC = () => {
	const [t] = useTranslation();
	const [isDomainListExpand, setIsDomainListExpand] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainList, setDomainList] = useState([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);

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
		if (searchDomainName && !isDomainSelect) {
			setTimeout(() => {
				getDomainLists(searchDomainName);
			}, 1000);
		}
	}, [searchDomainName, isDomainSelect]);

	const selectedDomain = useCallback((domain: any) => {
		setIsDomainSelect(true);
		setSearchDomainName(domain?.name);
		setIsDomainListExpand(false);
		replaceHistory(`/domain/${domain?.name}`);
	}, []);

	const options = useMemo(
		() => [
			{
				id: 1,
				name: t('domain.authentication', 'Authentication')
			},
			{
				id: 2,
				name: t('domain.virtual_hosts', 'Virtual Hosts')
			},
			{
				id: 3,
				name: t('domain.advanced', 'Advanced')
			},
			{
				id: 4,
				name: t('domain.free_busy', 'Free/Busy')
			},
			{
				id: 5,
				name: t('domain.mailbox_quota', 'Mailbox Quota')
			},
			{
				id: 6,
				name: t('domain.theme', 'Theme')
			}
		],
		[t]
	);

	return (
		<Container orientation="column" crossAlignment="flex-start" mainAlignment="flex-start">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
			</Row>
			{isDomainListExpand && (
				<Row width="fill" mainAlignment="flex-start">
					<Container orientation="column" crossAlignment="flex-start" mainAlignment="flex-start">
						<DomainLists domainList={domainList} selectedDomain={selectedDomain} t={t} />
					</Container>
				</Row>
			)}
			<Container crossAlignment="flex-start" mainAlignment="flex-start">
				<List
					items={options}
					ItemComponent={ListItem}
					selectedBackground="success"
					activeBackground="warning"
				/>
			</Container>
		</Container>
	);
};
export default DomainListPanel;
