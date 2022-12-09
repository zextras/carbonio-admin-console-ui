/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
	Text,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { debounce } from 'lodash';
import logo from '../../../../assets/gardian.svg';
import Paging from '../../../components/paging';
import { searchDirectory } from '../../../../services/search-directory-service';
import { useDomainStore } from '../../../../store/domain/store';
import ResourceEditDetailView from './resource-edit-detail-view';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { createResource } from '../../../../services/create-cal-resource-service';
import { createSignature } from '../../../../services/create-signature-service';
import CreateResource from './create-resource';
import { modifyCalendarResource } from '../../../../services/modify-cal-resource-service';

const DomainResources: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [resourceList, setResourceList] = useState<any[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedResourceList, setSelectedResourceList] = useState<any>({});
	const [showResourceEditDetailView, setShowResourceEditDetailView] = useState<boolean>(false);
	const [isEditMode, setIsEditMode] = useState<boolean>(false);
	const [isUpdateRecord, setIsUpdateRecord] = useState<boolean>(false);
	const [showCreateResourceView, setShowCreateResourceView] = useState<boolean>(false);
	const timer = useRef<any>();
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

	const doClickAction = useCallback((): void => {
		setIsEditMode(false);
		setShowResourceEditDetailView(true);
	}, []);

	const doDoubleClickAction = useCallback((): void => {
		setIsEditMode(true);
		setShowResourceEditDetailView(true);
	}, []);

	const handleClick = useCallback(
		(event: any) => {
			event.stopPropagation();
			clearTimeout(timer.current);
			if (event.detail === 1) {
				timer.current = setTimeout(doClickAction, 300);
			} else if (event.detail === 2) {
				doDoubleClickAction();
			}
		},
		[doClickAction, doDoubleClickAction]
	);

	const getResourceList = useCallback(
		(zimbraDomainName: any, queryString: any): void => {
			const attrs =
				'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraLastLogonTimestamp,zimbraAccountStatus';
			const types = 'resources';
			const query = `${queryString}(&(!(zimbraIsSystemAccount=TRUE)))`;

			searchDirectory(attrs, types, zimbraDomainName, query, offset, limit, 'name').then((data) => {
				const resourceListResponse = data?.calresource || [];
				if (resourceListResponse && Array.isArray(resourceListResponse)) {
					setTotalAccount(data?.searchTotal);
					const rList: any[] = [];
					resourceListResponse.forEach((item: any, index: number) => {
						rList.push({
							id: item?.id,
							columns: [
								<Text
									size="medium"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedResourceList(item);
										handleClick(e);
									}}
								>
									{item?.a?.find((a: any) => a?.n === 'displayName')?._content}
								</Text>,
								<Text
									size="medium"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedResourceList(item);
										handleClick(e);
									}}
								>
									{item?.name}
								</Text>,
								<Text
									size="medium"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedResourceList(item);
										handleClick(e);
									}}
								>
									{item?.a?.find((a: any) => a?.n === 'zimbraAccountStatus')?._content}
								</Text>,
								<Text
									size="medium"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedResourceList(item);
										handleClick(e);
									}}
								>
									{item?.a?.find((a: any) => a?.n === 'zimbraLastLogonTimestamp')?._content
										? moment(
												item?.a?.find((a: any) => a?.n === 'zimbraLastLogonTimestamp')?._content,
												'YYYYMMDDHHmmss.Z'
										  ).format('YY/MM/DD | hh:MM')
										: t('label.never_logged_in', 'Never logged In')}
								</Text>,
								<Text
									size="medium"
									weight="light"
									key={item?.id}
									color="gray0"
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedResourceList(item);
										handleClick(e);
									}}
								>
									{item?.a?.find((a: any) => a?.n === 'description')?._content}
								</Text>
							],
							item,
							clickable: true
						});
					});
					setResourceList(rList);
					setIsUpdateRecord(false);
				}
			});
		},
		[offset, limit, t, handleClick]
	);

	useEffect(() => {
		getResourceList(domainName, searchQuery);
	}, [offset, getResourceList, domainName, searchQuery]);

	useEffect(() => {
		if (isUpdateRecord) {
			getResourceList(domainName, searchQuery);
		}
	}, [isUpdateRecord, getResourceList, domainName, searchQuery]);

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

	const successSnackBar = useCallback(
		(resourceName: any): void => {
			createSnackbar({
				key: 'success',
				type: 'success',
				label: t('label.create_resource_success_msg', {
					resourceName,
					defaultValue: '{{resourceName}} has been created successfully'
				}),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar, t]
	);

	const errorSnackBar = useCallback(
		(text?: any): void => {
			createSnackbar({
				key: 'error',
				type: 'error',
				label:
					text || t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar, t]
	);

	const createResourceReq = useCallback(
		(
			name,
			password,
			attr,
			resourceName,
			signatureList,
			zimbraPrefCalendarAutoAcceptSignatureId,
			zimbraPrefCalendarAutoDeclineSignatureId,
			zimbraPrefCalendarAutoDenySignatureId
		) => {
			createResource(name, password, attr)
				.then((data) => {
					const resourceId = data?.calresource[0]?.id;
					if (resourceId) {
						if (signatureList && signatureList.length > 0) {
							const requests: any[] = [];
							signatureList.forEach((item: any) => {
								requests.push(createSignature(resourceId, item?.name, item?.content[0]?._content));
							});
							Promise.all(requests)
								.then((responses) => Promise.all(responses))
								.then((resData) => {
									if (
										zimbraPrefCalendarAutoAcceptSignatureId?.value === '' &&
										zimbraPrefCalendarAutoDeclineSignatureId?.value === '' &&
										zimbraPrefCalendarAutoDenySignatureId?.value === ''
									) {
										setShowCreateResourceView(false);
										successSnackBar(resourceName);
										setIsUpdateRecord(true);
									} else {
										const signatureRes: any[] = [];
										resData.forEach((res: any) => {
											signatureRes.push(res?.Body?.CreateSignatureResponse?.signature[0]);
										});
										const signtureAttr: any = {
											zimbraPrefCalendarAutoAcceptSignatureId:
												zimbraPrefCalendarAutoAcceptSignatureId?.value
													? signatureRes.filter(
															(item: any) =>
																// eslint-disable-next-line max-len
																item.name === zimbraPrefCalendarAutoAcceptSignatureId?.label
													  )[0]?.id
													: '',
											zimbraPrefCalendarAutoDeclineSignatureId:
												zimbraPrefCalendarAutoDeclineSignatureId?.value
													? signatureRes.filter(
															(item: any) =>
																// eslint-disable-next-line max-len
																item.name === zimbraPrefCalendarAutoDeclineSignatureId?.label
													  )[0]?.id
													: '',
											zimbraPrefCalendarAutoDenySignatureId:
												zimbraPrefCalendarAutoDenySignatureId?.value
													? signatureRes.filter(
															(item: any) =>
																// eslint-disable-next-line max-len
																item.name === zimbraPrefCalendarAutoDenySignatureId?.label
													  )[0]?.id
													: ''
										};
										const attrList: { n: string; _content: string }[] = [];
										Object.keys(signtureAttr).map((ele: any) =>
											attrList.push({ n: ele, _content: signtureAttr[ele] })
										);
										modifyCalendarResource(resourceId, attrList)
											.then((modifyData) => {
												setShowCreateResourceView(false);
												successSnackBar(resourceName);
												setIsUpdateRecord(true);
											})
											.catch((error) => {
												errorSnackBar(error?.message);
											});
									}
								})
								.catch((error) => {
									errorSnackBar();
								});
						} else {
							setShowCreateResourceView(false);
							successSnackBar(resourceName);
							setIsUpdateRecord(true);
						}
					}
				})
				.catch((error) => {
					errorSnackBar(error?.message);
				});
		},
		[errorSnackBar, successSnackBar]
	);

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
							<Padding right="large">
								<IconButton
									iconColor="gray6"
									backgroundColor="primary"
									icon="Plus"
									height={36}
									width={36}
									onClick={(): void => {
										setShowCreateResourceView(true);
									}}
								/>
							</Padding>
							<Padding right="large">
								<Button
									type="outlined"
									label={t('label.bulk_actions', 'Bulk Actions')}
									icon="ArrowIosDownward"
									iconPlacement="right"
									color="primary"
									disabled
									height={36}
								/>
							</Padding>
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
				<Row
					takeAvwidth="fill"
					mainAlignment="flex-start"
					width="100%"
					height="100%"
					padding={{ top: 'large' }}
				>
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
									backgroundColor="gray5"
									label={t('label.search_dot', 'Search…')}
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
							height="calc(100vh - 340px)"
						>
							{resourceList && resourceList.length > 0 && (
								<Table
									rows={resourceList}
									headers={headers}
									showCheckbox
									multiSelect
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
							padding={{ top: 'large', bottom: 'large' }}
						>
							{resourceList && resourceList.length > 0 && (
								<Row
									orientation="horizontal"
									crossAlignment="flex-start"
									mainAlignment="flex-start"
									width="100%"
									background="gray6"
								>
									<Divider />
									<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
								</Row>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
			{showResourceEditDetailView && (
				<ResourceEditDetailView
					selectedResourceList={selectedResourceList}
					setShowResourceEditDetailView={setShowResourceEditDetailView}
					isEditMode={isEditMode}
					setIsEditMode={setIsEditMode}
					setIsUpdateRecord={setIsUpdateRecord}
				/>
			)}
			{showCreateResourceView && (
				<CreateResource
					setShowCreateResourceView={setShowCreateResourceView}
					createResourceReq={createResourceReq}
				/>
			)}
		</Container>
	);
};

export default DomainResources;
