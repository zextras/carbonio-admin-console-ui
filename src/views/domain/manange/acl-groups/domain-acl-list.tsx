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
import { debounce } from 'lodash';
import logo from '../../../../assets/gardian.svg';
import Paging from '../../../components/paging';
import { searchDirectory } from '../../../../services/search-directory-service';
import EditAclListView from './edit-acl-detail-view';
import { useDomainStore } from '../../../../store/domain/store';
import {
	ALL,
	EMAIL,
	FALSE,
	GRP,
	MEMBERS_ONLY,
	PUB,
	RECORD_DISPLAY_LIMIT,
	TRUE
} from '../../../../constants';
import AclListDetail from './acl-list-detail';
import CreateAclList from './create-acl-list';
import { createAclList } from '../../../../services/create-acl-list-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

const DomainAclList: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [aclList, setAclList] = useState<any[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [selectedAclList, setSelectedAclList] = useState<any>({});
	const [showAclListDetailView, setShowAclListDetailView] = useState<any>();
	const [showEditAclView, setShowEditAclView] = useState<any>();
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedDlRow, setSelectedDlRow] = useState<any>([]);
	const [aclListItem, setAclListItem] = useState([]);
	const [selectedFromRow, setSelectedFromRow] = useState<any>({});
	const [editAclList, setEditAclList] = useState<boolean>(false);
	const [isUpdateRecord, setIsUpdateRecord] = useState<boolean>(false);
	const [showCreateAclListView, setShowCreateAclListView] = useState<boolean>(false);
	const timer = useRef<any>();
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const aclListStatusFilter: any = useMemo(
		() => [
			{
				label: t('label.can_send_receiver', 'Can Send & Receive'),
				value: '(&(zimbraMailStatus=enabled))'
			},
			{
				label: t('label.cant_send_receiver', "Can't Send & Receive"),
				value: '(&(zimbraMailStatus=disabled))'
			}
		],
		[t]
	);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '20%',
				bold: true
			},
			{
				id: 'address',
				label: t('label.address', 'Address'),
				width: '20%',
				bold: true
			},
			{
				id: 'members',
				label: t('label.members', 'Members'),
				width: '15%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '15%',
				i18nAllLabel: t('label.all', 'All'),
				bold: true,
				items: [
					{ label: aclListStatusFilter[0].label, value: aclListStatusFilter[0].value },
					{ label: aclListStatusFilter[1].label, value: aclListStatusFilter[1].value }
				],
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onChange: (e: any) => {
					if (e?.length > 0) {
						let statusQuery = '';
						e.forEach((item: { value: string }) => {
							statusQuery += item.value;
						});
						if (e?.length > 1) {
							statusQuery = `(|${statusQuery})`;
						}
						setStatusFilter(statusQuery);
					} else {
						setStatusFilter('');
					}
				}
			},
			{
				id: 'gal',
				label: t('label.gal', 'GAL'),
				width: '15%',
				bold: true
			},
			{
				id: 'description',
				label: t('label.description', 'Description'),
				width: '15%',
				bold: true
			}
		],
		[aclListStatusFilter, t]
	);

	const doClickAction = useCallback((): void => {
		setShowEditAclView(true);
		setShowAclListDetailView(false);
	}, []);

	const doDoubleClickAction = useCallback((): void => {
		setShowEditAclView(true);
		setShowAclListDetailView(false);
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

	const getAclList = useCallback((): void => {
		const attrs =
			'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
		const types = 'distributionlists,dynamicgroups';
		const query = `${searchQuery}(&(!(zimbraIsSystemAccount=TRUE))(zimbraIsAdminGroup=TRUE))`;
		setIsRequestInProgress(true);
		searchDirectory(attrs, types, domainName || '', query, offset, limit, 'name').then((data) => {
			const dlList = data?.dl;
			if (dlList) {
				if (data?.searchTotal) {
					setTotalAccount(data?.searchTotal);
				}
				const mList: any[] = [];
				dlList.forEach((item: any, index: number) => {
					mList.push({
						id: item?.id,
						columns: [
							<Container
								crossAlignment="flex-start"
								key={item?.id}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text size="medium" weight="light" key={`${item?.id}display-child`} color="gray0">
									{item?.a?.find((a: any) => a?.n === 'displayName')?._content}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								key={`${item?.id}-address`}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text size="medium" weight="light" key={`${item?.id}address-child`} color="gray0">
									{item?.name}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								key={`${item?.id}-member`}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text size="medium" weight="light" key={`${item?.id}member-child`} color="gray0">
									{''}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								key={`${item?.id}-status`}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text size="medium" weight="light" key={`${item?.id}status-child`} color="gray0">
									{item?.a?.find((a: any) => a?.n === 'zimbraMailStatus')?._content === 'enabled'
										? t('label.can_send_receiver', 'Can Send & Receive')
										: t('label.cant_send_receiver', "Can't Send & Receive")}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								key={`${item?.id}-gal`}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text size="medium" weight="light" key={`${item?.id}gal-child`} color="gray0">
									{''}
								</Text>
							</Container>,
							<Container
								crossAlignment="flex-start"
								key={`${item?.id}-description`}
								style={{ cursor: 'pointer' }}
								onClick={(e: { stopPropagation: () => void }): void => {
									e.stopPropagation();
									setSelectedAclList(item);
									setSelectedFromRow(item);
									handleClick(e);
								}}
							>
								<Text
									size="medium"
									weight="light"
									key={`${item?.id}description-child`}
									color="gray0"
								>
									{item?.a?.find((a: any) => a?.n === 'description')?._content}
								</Text>
							</Container>
						]
					});
				});
				setAclList(mList);
				setAclListItem(dlList);
				setIsUpdateRecord(false);
			} else {
				setTotalAccount(0);
				setAclList([]);
				setIsUpdateRecord(false);
			}
			setIsRequestInProgress(false);
		});
	}, [t, offset, limit, domainName, searchQuery, handleClick]);

	useEffect(() => {
		getAclList();
	}, [getAclList]);

	const generateSearchFilterQuery = useCallback((searchStr: string, sfilter: string): string => {
		let filterQuery = '';
		if (sfilter) {
			filterQuery += sfilter;
		}
		if (searchStr) {
			filterQuery += `(|(mail=*${searchStr}*)(cn=*${searchStr}*)(sn=*${searchStr}*)(gn=*${searchStr}*)(displayName=*${searchStr}*)(zimbraMailDeliveryAddress=*${searchStr}*))`;
		}
		if (sfilter && searchStr) {
			return `(&${filterQuery})`;
		}
		return filterQuery;
	}, []);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAclListQuery = useCallback(
		debounce((searchStr: string, sfilter: string) => {
			setTotalAccount(0);
			setSearchQuery(generateSearchFilterQuery(searchStr, sfilter));
		}, 700),
		[debounce, generateSearchFilterQuery]
	);

	useEffect(() => {
		searchAclListQuery(searchString, statusFilter);
	}, [searchString, searchAclListQuery, statusFilter]);

	useEffect(() => {
		if (showEditAclView !== undefined && !showEditAclView) {
			getAclList();
		}
	}, [showEditAclView, getAclList]);

	const onDetailClick = useCallback(() => {
		const selectedTableItem = aclListItem.find((item: any) => selectedDlRow[0] === item?.id);
		setSelectedFromRow(selectedTableItem);
		setSelectedAclList(selectedTableItem);
		setShowAclListDetailView(true);
		setShowAclListDetailView(true);
	}, [selectedDlRow, aclListItem]);

	useEffect(() => {
		if (showAclListDetailView !== undefined && !showAclListDetailView) {
			setShowAclListDetailView(false);
		}
	}, [showAclListDetailView]);

	useEffect(() => {
		if (editAclList) {
			setShowAclListDetailView(false);
			setEditAclList(false);
			setShowEditAclView(true);
		}
	}, [editAclList]);

	useEffect(() => {
		if (isUpdateRecord) {
			getAclList();
		}
	}, [isUpdateRecord, getAclList]);

	const onAddClick = useCallback(() => {
		setShowCreateAclListView(true);
	}, []);

	const callAllRequest = useCallback(
		(requests: any): void => {
			Promise.all(requests)
				.then((response: any) => Promise.all(response.map((res: any) => res.json())))
				.then((data: any) => {
					setIsUpdateRecord(true);
					// eslint-disable-next-line no-shadow
					let isError = false;
					let errorMessage = '';
					data.forEach((item: any) => {
						if (item?.Body?.Fault) {
							isError = true;
							errorMessage = item?.Body?.Fault?.Reason?.Text;
						}
					});
					if (isError) {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: errorMessage,
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					}
				})
				.catch((error) => {
					setIsUpdateRecord(true);
				});
		},
		[createSnackbar]
	);

	const getOwnerType = useCallback((ownersList: any, email?: string): any => {
		let type = 'email';
		ownersList.forEach((item: any) => {
			if (item?._attrs && item?._attrs?.type && item?._attrs?.email === email) {
				type = item?._attrs?.type === 'group' ? 'grp' : 'usr';
			}
		});
		return type;
	}, []);

	const addMemberToAclList = useCallback(
		(members: any, owners: any, mlId: string, ownersList: Array<any>): void => {
			const request: any[] = [];
			if (members.length > 0 && mlId) {
				members.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: mlId
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: item
					};
					request.push(addDistributionListMember(id, dlmItem));
				});
			}

			if (owners.length > 0 && mlId) {
				owners.forEach((item: any) => {
					const dl: any = {
						by: 'id',
						_content: mlId
					};
					const action: any = {
						op: 'addOwners',
						owner: {
							by: 'name',
							type: getOwnerType(ownersList, item),
							_content: item
						}
					};
					request.push(distributionListAction(dl, action));
				});
			}
			if (request.length > 0) {
				callAllRequest(request);
			} else {
				setIsUpdateRecord(true);
			}
		},
		[callAllRequest, getOwnerType]
	);

	const createAclListReq = useCallback(
		(
			name,
			description,
			dynamic,
			displayName,
			zimbraHideInGal,
			zimbraIsACLGroup,
			zimbraMailStatus,
			zimbraNotes,
			memberURL,
			members,
			zimbraDistributionListSendShareMessageToNewMembers,
			owners,
			zimbraDistributionListSubscriptionPolicy,
			zimbraDistributionListUnsubscriptionPolicy,
			allOwnersList,
			ownerGrantEmailType,
			ownerGrantEmails
		) => {
			const attributes: any[] = [];
			attributes.push({
				n: 'displayName',
				_content: displayName
			});
			attributes.push({
				n: 'zimbraNotes',
				_content: zimbraNotes
			});
			attributes.push({
				n: 'zimbraHideInGal',
				_content: zimbraHideInGal ? TRUE : FALSE
			});
			attributes.push({
				n: 'zimbraMailStatus',
				_content: zimbraMailStatus ? 'enabled' : 'disabled'
			});
			attributes.push({
				n: 'zimbraIsAdminGroup',
				_content: TRUE
			});
			if (dynamic) {
				attributes.push({
					n: 'zimbraIsACLGroup',
					_content: memberURL !== '' ? 'FALSE' : 'TRUE'
				});
				attributes.push({
					n: 'memberURL',
					_content: memberURL
				});
			} else {
				attributes.push({
					n: 'description',
					_content: description
				});
				attributes.push({
					n: 'zimbraDistributionListSendShareMessageToNewMembers',
					_content: zimbraDistributionListSendShareMessageToNewMembers ? TRUE : FALSE
				});
				attributes.push({
					n: 'zimbraDistributionListUnsubscriptionPolicy',
					_content: zimbraDistributionListUnsubscriptionPolicy?.value
				});

				attributes.push({
					n: 'zimbraDistributionListSubscriptionPolicy',
					_content: zimbraDistributionListSubscriptionPolicy?.value
				});
			}
			let dl: any = {};
			let action: any = {};
			if (ownerGrantEmailType?.value === PUB) {
				dl = { by: 'name', _content: name };
				action = {
					op: 'setRights',
					right: { right: 'sendToDistList', grantee: [] }
				};
			} else if (ownerGrantEmailType?.value === GRP) {
				dl = { by: 'name', _content: name };
				action = {
					op: 'setRights',
					right: {
						right: 'sendToDistList',
						grantee: [{ type: 'grp', by: 'name', _content: name }]
					}
				};
			} else if (ownerGrantEmailType?.value === ALL) {
				dl = { by: 'name', _content: name };
				action = {
					op: 'setRights',
					right: { right: 'sendToDistList', grantee: [{ type: 'all' }] }
				};
			} else if (ownerGrantEmailType?.value === EMAIL) {
				dl = { by: 'name', _content: name };
				action = {
					op: 'setRights',
					right: {
						right: 'sendToDistList',
						grantee: ownerGrantEmails.map((item: any) => ({
							type: 'email',
							by: 'name',
							_content: item
						}))
					}
				};
			}
			createAclList(dynamic, name, attributes)
				.then((data) => {
					const type = 'success';
					let message = '';
					const mlId = data?.dl[0]?.id;
					addMemberToAclList(members, owners, mlId, allOwnersList);
					callAllRequest([distributionListAction(dl, action)]);
					setShowCreateAclListView(false);
					message = t('label.the_has_been_created_success', {
						name,
						defaultValue: 'The {{name}} has been created successfully'
					});
					createSnackbar({
						key: 'success',
						type,
						label: message,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				})
				.catch((error) => {
					let message = '';
					if (error?.message) {
						const text = error?.message;
						if (text.includes('no such domain')) {
							message = t('label.specified_domain_not_exist', 'Specified domain does not exist');
						} else if (text.includes('email address already exists')) {
							message = t('label.email_addready_exists', {
								name,
								defaultValue: 'Email address {{name}} already exists'
							});
						} else {
							message = text;
						}
					}
					createSnackbar({
						key: 'error',
						type: 'error',
						label:
							message ||
							t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, addMemberToAclList, callAllRequest]
	);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="30%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.acl_list', 'Acl List')}
							</Text>
						</Row>
						<Row width="70%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding>
								<IconButton
									iconColor="gray6"
									backgroundColor="primary"
									icon="Plus"
									height={36}
									width={36}
									onClick={onAddClick}
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
				width="100%"
				height="calc(100vh - 12.5rem)"
				padding={{ top: 'large' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
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
									disabled={aclList.length === 0 && searchString.length === 0}
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
							style={{
								height:
									aclList.length > 0 && !isRequestInProgress
										? 'calc(100vh - 21.25rem)'
										: 'calc(100vh - 40.625rem)'
							}}
						>
							<Table
								rows={!isRequestInProgress ? aclList : []}
								headers={headers}
								showCheckbox
								style={{ overflow: 'auto', height: '100%' }}
								selectedRows={selectedDlRow}
								onSelectionChange={(selected: any): void => {
									setSelectedFromRow(aclListItem.find((item: any) => selected[0] === item?.id));
									setSelectedDlRow(selected);
								}}
								RowFactory={CustomRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
							{isRequestInProgress && (
								<Container
									crossAlignment="center"
									mainAlignment="center"
									height="auto"
									padding={{ top: 'medium' }}
								>
									<Button
										type="ghost"
										iconColor="primary"
										height={36}
										label=""
										width={36}
										loading
									/>
								</Container>
							)}
							{aclList.length === 0 && !isRequestInProgress && (
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
												i18nKey="label.create_acl_list_msg"
												defaults="You can create a new Acl List by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
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
							style={{ position: 'absolute', bottom: '0.25rem' }}
						>
							{aclList && aclList.length > 0 && (
								<Paging totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
							)}
						</Row>
					</Container>
				</Row>
			</Container>
			{showEditAclView && (
				<EditAclListView
					selectedAclList={selectedAclList}
					setShowEditAclList={setShowEditAclView}
					setIsUpdateRecord={setIsUpdateRecord}
				/>
			)}

			{showAclListDetailView && (
				<AclListDetail
					selectedAclList={selectedFromRow}
					setShowAclListDetailView={setShowAclListDetailView}
					setEditAclList={setEditAclList}
					setIsUpdateRecord={setIsUpdateRecord}
				/>
			)}

			{showCreateAclListView && (
				<CreateAclList
					setShowCreateAclListView={setShowCreateAclListView}
					createAclListReq={createAclListReq}
				/>
			)}
		</Container>
	);
};

export default DomainAclList;
