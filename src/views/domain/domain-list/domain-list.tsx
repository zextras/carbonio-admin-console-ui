/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useMemo, useCallback, useRef, ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { Container, Input, Row, Text, Table, Divider, Icon } from '@zextras/carbonio-design-system';
import logo from '../../../assets/gardian.svg';
import Paging from '../../components/paging';
import { getDomainList } from '../../../services/search-domain-service';
import CustomRowFactory from '../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../app/shared/customTableHeaderFactory';
import { GENERAL_SETTINGS } from '../../../constants';
import { useDomainStore } from '../../../store/domain/store';
import TrackNumberPerPage from '../../app/shared/track-number-per-page';

type StatusItem = {
	color: string;
	label: string;
};

type StatusTypes = {
	active: StatusItem;
	maintenance: StatusItem;
	locked: StatusItem;
	closed: StatusItem;
	pending: StatusItem;
	lockout: StatusItem;
};
type ZimbraDomainAttribute = {
	n: string;
	_content: string;
};

type ZimbraDomain = {
	name: string;
	id: string;
	a: ZimbraDomainAttribute[];
};

type ZimbraDomainResponse = {
	domain: ZimbraDomain[];
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

type ZimbraDomainEntry = {
	name: string;
	id: string;
	a: ZimbraDomainAttribute[];
	zimbraDomainType: string;
	zimbraDomainStatus: 'active' | 'maintenance' | 'locked' | 'closed' | 'pending' | 'lockout';
	zimbraDomainName: string;
	zimbraId: string;
};

const DomainList: FC = () => {
	const [t] = useTranslation();
	const setDomain = useDomainStore((state) => state.setDomain);
	const setDomainView = useDomainStore((state) => state.setDomainView);
	const [limit, setLimit] = useState<number>(10);

	const tableRef = useRef(null);

	const headers = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.domain_name', 'Domain Name'),
				width: '25%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '75%',
				bold: true
			}
		],
		[t]
	);

	const [domainList, setDomainList] = useState<
		{
			id: string;
			columns: ReactElement[];
			iteam: ZimbraDomainEntry;
			clickable: boolean;
		}[]
	>([]);
	const [offset, setOffset] = useState<number>(0);
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [totalDomain, setTotalDomain] = useState<number>(0);

	const STATUS_COLOR: StatusTypes = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			maintenance: {
				color: '#2196D3',
				label: t('label.in_maintenance', 'In maintenance')
			},
			locked: {
				color: '#D74942',
				label: t('label.locked', 'Locked')
			},
			closed: {
				color: '#828282',
				label: t('label.closed', 'Closed')
			},
			pending: {
				color: '#828282',
				label: t('label.pending', 'Pending')
			},
			lockout: {
				color: '#D74942',
				label: t('label.lockout', 'Lockout')
			}
		}),
		[t]
	);

	const onDomainSelect = useCallback(
		(domain: ZimbraDomainEntry) => {
			setDomain({
				a: domain?.a,
				id: domain?.id,
				name: domain?.name
			});
			setDomainView(GENERAL_SETTINGS);
		},
		[setDomain, setDomainView]
	);

	const getAllDomainList = useCallback((): void => {
		getDomainList(searchQuery, offset, limit).then((data) => {
			const domainListResponse: ZimbraDomainResponse = data?.domain || [];
			if (domainListResponse && Array.isArray(domainListResponse)) {
				const domainListArr: {
					id: string;
					columns: ReactElement[];
					iteam: ZimbraDomainEntry;
					clickable: boolean;
				}[] = [];
				setTotalDomain(data.searchTotal || 0);
				domainListResponse.forEach((item: ZimbraDomainEntry) => {
					const domainIteam: ZimbraDomainEntry = {
						name: item.name,
						id: item.id,
						zimbraDomainType: '',
						zimbraDomainStatus: 'active',
						zimbraDomainName: '',
						zimbraId: '',
						a: item.a
					};
					item?.a?.forEach((ele: ZimbraDomainAttribute) => {
						if (ele.n === 'zimbraDomainType') {
							domainIteam.zimbraDomainType = ele._content;
						} else if (ele.n === 'zimbraDomainStatus') {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							domainIteam.zimbraDomainStatus = ele._content;
						} else if (ele.n === 'zimbraDomainName') {
							domainIteam.zimbraDomainName = ele._content;
						} else if (ele.n === 'zimbraId') {
							domainIteam.zimbraId = ele._content;
						}
					});
					domainListArr.push({
						id: item?.id,
						columns: [
							<Text
								size="small"
								key={item?.id}
								color="gray0"
								weight="regular"
								onClick={(): void => {
									onDomainSelect(domainIteam);
								}}
							>
								{item?.name || ' '}
							</Text>,

							<Text
								size="small"
								weight="light"
								key={item?.id}
								color={STATUS_COLOR[domainIteam.zimbraDomainStatus].color}
								onClick={(): void => {
									onDomainSelect(domainIteam);
								}}
							>
								{STATUS_COLOR[domainIteam.zimbraDomainStatus].label}
							</Text>
						],
						iteam: domainIteam,
						clickable: true
					});
				});
				setDomainList(domainListArr);
			}
		});
	}, [STATUS_COLOR, offset, onDomainSelect, searchQuery, limit]);
	useEffect(() => {
		getAllDomainList();
	}, [getAllDomainList]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainList = useCallback(
		debounce((searchText) => {
			setSearchQuery(searchText);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		searchDomainList(searchString);
	}, [domainList, offset, searchDomainList, searchString]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('domain.domain_list', 'Domains List')}
							</Text>
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				height="calc(100vh - 12.5rem)"
				padding={{ top: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ bottom: 'large' }}
						>
							<Container>
								<Input
									label={t('label.i_am_looking_for_this_domain', `I'm looking for this domain…`)}
									disabled={domainList.length === 0 && searchString.length === 0}
									value={searchString}
									backgroundColor="gray5"
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setSearchString(e.target.value);
									}}
									CustomIcon={(): JSX.Element => (
										<Icon icon="FunnelOutline" size="large" color="primary" />
									)}
								/>
							</Container>
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							height="calc(100vh - 21.25rem)"
							ref={tableRef}
						>
							{domainList.length !== 0 && (
								<Table
									rows={domainList}
									headers={headers}
									showCheckbox={false}
									multiSelect={false}
									style={{ overflow: 'auto', height: '100%' }}
									RowFactory={CustomRowFactory}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									HeaderFactory={CustomHeaderFactory}
								/>
							)}
							{domainList.length === 0 && (
								<Container orientation="column" crossAlignment="center" mainAlignment="center">
									<Row>
										<img src={logo} alt="logo" />
									</Row>
									<Row
										padding={{ top: 'extralarge' }}
										orientation="vertical"
										crossAlignment="center"
										style={{ textAlign: 'center' }}
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											{t('label.this_list_is_empty', 'This list is empty.')}
										</Text>
									</Row>
									<Row
										orientation="vertical"
										crossAlignment="center"
										style={{ textAlign: 'center' }}
										padding={{ top: 'small' }}
										width="53%"
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											<Trans
												i18nKey="label.create_domain_list_msg"
												defaults="You can create a new Domain by clicking on <bold>Create</bold> button on header menu"
												components={{ bold: <strong /> }}
											/>
										</Text>
									</Row>
								</Container>
							)}
							<Row
								orientation="horizontal"
								mainAlignment="space-between"
								crossAlignment="flex-start"
								width="fill"
								padding={{ top: 'medium' }}
							>
								<Divider />
							</Row>
							{domainList.length !== 0 && (
								<Container
									orientation="horizontal"
									mainAlignment="space-between"
									width="100%"
									height="auto"
								>
									<Container crossAlignment="flex-start">
										<Paging totalItem={totalDomain} setOffset={setOffset} pageSize={limit} />
									</Container>
									<Container
										crossAlignment="flex-end"
										orientation="horizontal"
										mainAlignment="flex-end"
										padding={{ top: 'small' }}
									>
										<TrackNumberPerPage pageSize={limit} />
									</Container>
								</Container>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default DomainList;
