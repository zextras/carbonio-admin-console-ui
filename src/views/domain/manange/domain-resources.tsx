/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	IconButton,
	Divider,
	Button,
	Padding,
	Icon,
	Input,
	Table,
	Text
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { debounce } from 'lodash';
import logo from '../../../assets/gardian.svg';
import Paginig from '../../components/paging';
import { searchDirectory } from '../../../services/search-directory-service';
import { useDomainStore } from '../../../store/domain/store';

const DomainResources: FC = () => {
	const [t] = useTranslation();
	const [resourceList, setResourceList] = useState<any[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(50);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const headers: any[] = useMemo(
		() => [
			{
				id: 'resource',
				label: t('label.resource', 'Resource'),
				width: '15%',
				bold: true
			},
			{
				id: 'email',
				label: t('label.email', 'Email'),
				width: '25%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '10%',
				bold: true
			},
			{
				id: 'last_access',
				label: t('label.last_access', 'Last Access'),
				width: '15%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '35%',
				bold: true
			}
		],
		[t]
	);

	const getResourceList = useCallback(
		(zimbraDomainName: any, queryString: any): void => {
			const attrs =
				'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraLastLogonTimestamp,zimbraAccountStatus';
			const types = 'resources';
			const query = `${queryString}(&(!(zimbraIsSystemAccount=TRUE)))`;

			searchDirectory(attrs, types, zimbraDomainName, query, offset, limit, 'name')
				.then((response) => response.json())
				.then((data) => {
					const resourceListResponse = data?.Body?.SearchDirectoryResponse?.calresource || [];
					if (resourceListResponse && Array.isArray(resourceListResponse)) {
						setTotalAccount(data?.Body?.SearchDirectoryResponse?.searchTotal);
						const rList: any[] = [];
						resourceListResponse.forEach((item: any, index: number) => {
							rList.push({
								id: item?.id,
								columns: [
									<Text size="medium" weight="light" key={item?.id} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'displayName')?._content}
									</Text>,
									<Text size="medium" weight="light" key={item?.id} color="gray0">
										{item?.name}
									</Text>,
									<Text size="medium" weight="light" key={item?.id} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'zimbraAccountStatus')?._content}
									</Text>,
									<Text size="medium" weight="light" key={item?.id} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'zimbraLastLogonTimestamp')?._content
											? moment(
													item?.a?.find((a: any) => a?.n === 'zimbraLastLogonTimestamp')?._content,
													'YYYYMMDDHHmmss.Z'
											  ).format('YY/MM/DD | hh:MM')
											: t('label.never_logged_in', 'Never logged In')}
									</Text>,
									<Text size="medium" weight="light" key={item?.id} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'description')?._content}
									</Text>
								]
							});
						});
						setResourceList(rList);
					}
				});
		},
		[t, offset, limit]
	);

	useEffect(() => {
		getResourceList(domainName, searchQuery);
	}, [offset, getResourceList, domainName, searchQuery]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchResourceQuery = useCallback(
		debounce((searchText) => {
			if (searchText) {
				setSearchQuery(
					`(|(mail=*${searchText}*)(cn=*${searchText}*)(sn=*${searchText}*)(gn=*${searchText}*)(displayName=*${searchText}*)(zimbraMailDeliveryAddress=*${searchText}*))`
				);
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchResourceQuery(searchString);
	}, [searchString, searchResourceQuery]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.resources', 'Resources')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="medium">
								<IconButton
									iconColor="gray6"
									backgroundColor="primary"
									icon="Plus"
									height={36}
									width={36}
								/>
							</Padding>
							<Padding right="medium">
								<Button
									label={t('label.details', 'Details')}
									color="primary"
									type="outlined"
									disabled
								/>
							</Padding>
							<Button
								type="outlined"
								label={t('label.bulk_actions', 'Bulk Actions')}
								icon="ArrowIosDownward"
								iconPlacement="right"
								color="primary"
								disabled
							/>
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
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 200px)"
				padding={{ top: 'large' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" height="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
						>
							<Container>
								<Input
									backgroundColor="gray5"
									label={t('label.search_dot', 'Search ...')}
									onChange={(e: any): any => {
										setSearchString(e.target.value);
									}}
									CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
								/>
							</Container>
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
							height="calc(100vh - 340px)"
						>
							{resourceList && resourceList.length > 0 && (
								<Table
									rows={resourceList}
									headers={headers}
									showCheckbox={false}
									style={{ overflow: 'auto', height: '100%' }}
								/>
							)}
							{resourceList.length === 0 && (
								<Container orientation="column" crossAlignment="center" mainAlignment="center">
									<Row>
										<img src={logo} alt="logo" />
									</Row>
									<Row
										padding={{ top: 'extralarge' }}
										orientation="vertical"
										crossAlignment="center"
										style={{ 'text-align': 'center' }}
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											{t('label.this_list_is_empty', 'This list is empty.')}
										</Text>
									</Row>
									<Row
										orientation="vertical"
										crossAlignment="center"
										style={{ 'text-align': 'center' }}
										padding={{ top: 'small' }}
										width="53%"
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											<Trans
												i18nKey="label.create_resource_msg"
												defaults="You can create a new resource by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
												components={{ bold: <strong /> }}
											/>
										</Text>
									</Row>
								</Container>
							)}
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'large' }}
						>
							{resourceList && resourceList.length > 0 && (
								<Row orientation="horizontal" width="100%" background="gray6">
									<Divider />
									<Paginig totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
								</Row>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default DomainResources;
