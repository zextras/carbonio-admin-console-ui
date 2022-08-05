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
import Paginig from '../../../components/paging';
import { searchDirectory } from '../../../../services/search-directory-service';
import EditMailingListView from './edit-mailing-detail-view';
import { useDomainStore } from '../../../../store/domain/store';
import { FALSE, RECORD_DISPLAY_LIMIT, TRUE } from '../../../../constants';
import MailingListDetail from './mailing-list-detail';
import CreateMailingList from './create-mailing-list';
import { createMailingList } from '../../../../services/create-mailing-list-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';

const DomainMailingList: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const domainName = useDomainStore((state) => state.domain?.name);
	const [mailingList, setMailingList] = useState<any[]>([]);
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [totalAccount, setTotalAccount] = useState<number>(0);
	const [selectedMailingList, setSelectedMailingList] = useState<any>({});
	const [showMailingListDetailView, setShowMailingListDetailView] = useState<any>();
	const [showEditMailingView, setShowEditMailingView] = useState<any>();
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedDlRow, setSelectedDlRow] = useState<any>([]);
	const [mailingListItem, setMailingListItem] = useState([]);
	const [selectedFromRow, setSelectedFromRow] = useState<any>({});
	const [editMailingList, setEditMailingList] = useState<boolean>(false);
	const [isUpdateRecord, setIsUpdateRecord] = useState<boolean>(false);
	const [showCreateMailingListView, setShowCreateMailingListView] = useState<boolean>(false);
	const timer = useRef<any>();
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
				bold: true
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
		[t]
	);

	const doClickAction = useCallback((): void => {
		setShowMailingListDetailView(true);
		setShowEditMailingView(false);
	}, []);

	const doDoubleClickAction = useCallback((): void => {
		setShowEditMailingView(true);
		setShowMailingListDetailView(false);
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

	const getMailingList = useCallback((): void => {
		const attrs =
			'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
		const types = 'distributionlists,dynamicgroups';
		const query = `${searchQuery}(&(!(zimbraIsSystemAccount=TRUE)))`;
		setMailingListItem([]);
		searchDirectory(attrs, types, domainName || '', query, offset, limit, 'name')
			.then((response) => response.json())
			.then((data) => {
				const dlList = data?.Body?.SearchDirectoryResponse?.dl;
				if (dlList) {
					if (data?.Body?.SearchDirectoryResponse?.searchTotal) {
						setTotalAccount(data?.Body?.SearchDirectoryResponse?.searchTotal);
					}
					const mList: any[] = [];
					dlList.forEach((item: any, index: number) => {
						mList.push({
							id: item?.id,
							columns: [
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={item?.id}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
										setSelectedFromRow(item);
										handleClick(e);
									}}
								>
									<Text size="medium" weight="light" key={`${item?.id}display-child`} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'displayName')?._content}
									</Text>
								</Row>,
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={`${item?.id}-address`}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
										setSelectedFromRow(item);
										handleClick(e);
									}}
								>
									<Text size="medium" weight="light" key={`${item?.id}address-child`} color="gray0">
										{item?.name}
									</Text>
								</Row>,
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={`${item?.id}-member`}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
										setSelectedFromRow(item);
										handleClick(e);
									}}
								>
									<Text size="medium" weight="light" key={`${item?.id}member-child`} color="gray0">
										{''}
									</Text>
								</Row>,
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={`${item?.id}-status`}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
										setSelectedFromRow(item);
										handleClick(e);
									}}
								>
									<Text size="medium" weight="light" key={`${item?.id}status-child`} color="gray0">
										{item?.a?.find((a: any) => a?.n === 'zimbraMailStatus')?._content === 'enabled'
											? t('label.can_receive', 'Can receive')
											: ''}
									</Text>
								</Row>,
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={`${item?.id}-gal`}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
										setSelectedFromRow(item);
										handleClick(e);
									}}
								>
									<Text size="medium" weight="light" key={`${item?.id}gal-child`} color="gray0">
										{''}
									</Text>
								</Row>,
								<Row
									mainAlignment="flex-start"
									crossAlignment="flex-start"
									key={`${item?.id}-description`}
									style={{ cursor: 'pointer' }}
									onClick={(e: { stopPropagation: () => void }): void => {
										e.stopPropagation();
										setSelectedMailingList(item);
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
								</Row>
							]
						});
					});
					setMailingList(mList);
					setMailingListItem(dlList);
					setIsUpdateRecord(false);
				} else {
					setTotalAccount(0);
					setMailingList([]);
					setIsUpdateRecord(false);
				}
			});
	}, [t, offset, limit, domainName, searchQuery, handleClick]);

	useEffect(() => {
		getMailingList();
	}, [offset, getMailingList]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchMailingListQuery = useCallback(
		debounce((searchText) => {
			if (searchText) {
				setOffset(0);
				setSearchQuery(
					`(|(mail=*${searchText}*)(cn=*${searchText}*)(sn=*${searchText}*)(gn=*${searchText}*)(displayName=*${searchText}*)(zimbraMailDeliveryAddress=*${searchText}*))`
				);
			} else {
				setOffset(0);
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchMailingListQuery(searchString);
	}, [searchString, searchMailingListQuery]);

	useEffect(() => {
		if (showEditMailingView !== undefined && !showEditMailingView) {
			getMailingList();
		}
	}, [showEditMailingView, getMailingList]);

	const onDetailClick = useCallback(() => {
		const selectedTableItem = mailingListItem.find((item: any) => selectedDlRow[0] === item?.id);
		setSelectedFromRow(selectedTableItem);
		setSelectedMailingList(selectedTableItem);
		setShowMailingListDetailView(true);
		setShowMailingListDetailView(true);
	}, [selectedDlRow, mailingListItem]);

	useEffect(() => {
		if (showMailingListDetailView !== undefined && !showMailingListDetailView) {
			setShowMailingListDetailView(false);
		}
	}, [showMailingListDetailView]);

	useEffect(() => {
		if (editMailingList) {
			setShowMailingListDetailView(false);
			setEditMailingList(false);
			setShowEditMailingView(true);
		}
	}, [editMailingList]);

	useEffect(() => {
		if (isUpdateRecord) {
			getMailingList();
		}
	}, [isUpdateRecord, getMailingList]);

	const onAddClick = useCallback(() => {
		setShowCreateMailingListView(true);
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

	const addMemberToMailingList = useCallback(
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

	const createMailingListReq = useCallback(
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
			allOwnersList
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
			createMailingList(dynamic, name, attributes)
				.then((response) => response.json())
				.then((data) => {
					let type = 'success';
					let message = '';
					if (data?.Body?.Fault?.Reason?.Text) {
						type = 'error';
						const text = data?.Body?.Fault?.Reason?.Text;
						if (text.contains('no such domain')) {
							message = t('label.specified_domain_not_exist', 'Specified domain does not exist');
						} else {
							message = text;
						}
					} else {
						const mlId = data?.Body?.CreateDistributionListResponse?.dl[0]?.id;
						addMemberToMailingList(members, owners, mlId, allOwnersList);
						setShowCreateMailingListView(false);
						message = t('label.the_has_been_created_success', {
							name,
							defaultValue: 'The {{name}} has been created successfull'
						});
					}
					createSnackbar({
						key: type,
						type,
						label: message,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, t, addMemberToMailingList]
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
								{t('label.mailing_list', 'Mailing List')}
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
									onClick={onAddClick}
								/>
							</Padding>
							<Padding right="large">
								<Button
									label={t('label.details', 'Details')}
									color="primary"
									type="outlined"
									disabled={selectedDlRow && selectedDlRow.length !== 1}
									height={36}
									onClick={onDetailClick}
								/>
							</Padding>
							<Button
								type="outlined"
								label={t('label.bulk_actions', 'Bulk Actions')}
								icon="ArrowIosDownward"
								iconPlacement="right"
								color="primary"
								disabled
								height={36}
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
				width="100%"
				height="calc(100vh - 200px)"
				padding={{ top: 'extralarge' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
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
							height="calc(100vh - 340px)"
						>
							{mailingList && mailingList.length > 0 && (
								<Table
									rows={mailingList}
									headers={headers}
									showCheckbox
									style={{ overflow: 'auto', height: '100%' }}
									selectedRows={selectedDlRow}
									onSelectionChange={(selected: any): void => {
										setSelectedFromRow(
											mailingListItem.find((item: any) => selected[0] === item?.id)
										);
										setSelectedDlRow(selected);
									}}
								/>
							)}
							{mailingList.length === 0 && (
								<Container orientation="column" crossAlignment="center" mainAlignment="flex-start">
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
												i18nKey="label.create_mailing_list_msg"
												defaults="You can create a new Mailing List by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
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
							{mailingList && mailingList.length > 0 && (
								<Paginig totalItem={totalAccount} setOffset={setOffset} pageSize={limit} />
							)}
						</Row>
					</Container>
				</Row>
			</Container>
			{showEditMailingView && (
				<EditMailingListView
					selectedMailingList={selectedMailingList}
					setShowEditMailingList={setShowEditMailingView}
					setIsUpdateRecord={setIsUpdateRecord}
				/>
			)}

			{showMailingListDetailView && (
				<MailingListDetail
					selectedMailingList={selectedFromRow}
					setShowMailingListDetailView={setShowMailingListDetailView}
					setEditMailingList={setEditMailingList}
				/>
			)}

			{showCreateMailingListView && (
				<CreateMailingList
					setShowCreateMailingListView={setShowCreateMailingListView}
					createMailingListReq={createMailingListReq}
				/>
			)}
		</Container>
	);
};

export default DomainMailingList;
