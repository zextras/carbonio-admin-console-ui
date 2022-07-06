/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
	Container,
	Row,
	IconButton,
	Divider,
	Modal,
	Padding,
	Input,
	Table,
	Text,
	Select,
	Switch,
	ChipInput,
	Button,
	SnackbarManagerContext,
	Icon
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { isEqual } from 'lodash';
import ListRow from '../../list/list-row';
import Paginig from '../../components/paging';
import { getDistributionList } from '../../../services/get-distribution-list';
import { getDistributionListMembership } from '../../../services/get-distributionlists-membership-service';
import { getDateFromStr } from '../../utility/utils';
import { searchDirectory } from '../../../services/search-directory-service';
import { modifyDistributionList } from '../../../services/modify-distributionlist-service';
import { renameDistributionList } from '../../../services/rename-distributionlist-service';
import { addDistributionListMember } from '../../../services/add-distributionlist-member-service';
import { removeDistributionListMember } from '../../../services/remove-distributionlist-member-service';
import { distributionListAction } from '../../../services/distribution-list-action-service';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

// eslint-disable-next-line no-shadow
export enum TRUE_FALSE {
	TRUE = 'TRUE',
	FALSE = 'FALSE'
}

const EditMailingListView: FC<any> = ({
	selectedMailingList,
	setShowEditMailingList,
	setIsUpdateRecord
}) => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [memberOffset, setMemberOffset] = useState<number>(0);
	const [ownerOffset, setOwnerOffset] = useState<number>(0);
	const [displayName, setDisplayName] = useState<string>('');
	const [distributionName, setDistributionName] = useState<string>('');
	const [
		zimbraDistributionListSendShareMessageToNewMembers,
		setZimbraDistributionListSendShareMessageToNewMembers
	] = useState<boolean>(false);

	const [zimbraHideInGal, setZimbraHideInGal] = useState<boolean>(false);
	const [zimbraMailAlias, setZimbraMailAlias] = useState<any>([]);
	const [dlm, setDlm] = useState<any[]>([]);
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [zimbraCreateTimestamp, setZimbraCreateTimestamp] = useState<string>('');
	const [dlId, setdlId] = useState<string>('');
	const [dlMembershipList, setDlMembershipList] = useState<any>([]);
	const [dlmTableRows, setDlmTableRows] = useState<any>([]);
	const [ownersList, setOwnersList] = useState<any[]>([]);
	const [ownerTableRows, setOwnerTableRows] = useState<any[]>([]);
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<any[]>([]);
	const [selectedOwnerListMember, setSelectedOwnerListMember] = useState<any[]>([]);
	const [searchMemberList, setSearchMemberList] = useState<any[]>([]);
	const [openAddMailingListDialog, setOpenAddMailingListDialog] = useState<boolean>(false);
	const [isRequstInProgress, setIsRequstInProgress] = useState<boolean>(false);
	const [isAddToOwnerList, setIsAddToOwnerList] = useState<boolean>(false);
	const [searchMailingListOrUser, setSearchMailingListOrUser] = useState<string>('');
	const [isShowError, setIsShowError] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [searchMember, setSearchMember] = useState<string>();

	const dlCreateDate = useMemo(
		() =>
			!!zimbraCreateTimestamp && zimbraCreateTimestamp !== null && zimbraCreateTimestamp !== ''
				? moment(getDateFromStr(zimbraCreateTimestamp)).format('DD MMM YYYY - hh:MM')
				: '',
		[zimbraCreateTimestamp]
	);

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.members', 'Members'),
				width: '80%',
				bold: true
			},
			{
				id: 'address',
				label: t('label.type', 'Type'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const ownerHeaders: any[] = useMemo(
		() => [
			{
				id: 'owners',
				label: t('label.owners', 'Owners'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	const subscriptionUnsubscriptionRequestOptions: any[] = useMemo(
		() => [
			{
				label: t('label.automatically_accept', 'Automatically accept'),
				value: SUBSCRIBE_UNSUBSCRIBE.ACCEPT
			},
			{
				label: t('label.require_list_owner_approval', 'Require list owner approval'),
				value: SUBSCRIBE_UNSUBSCRIBE.APPROVAL
			},
			{
				label: t('label.automatically_reject', 'Automatically reject'),
				value: SUBSCRIBE_UNSUBSCRIBE.REJECT
			}
		],
		[t]
	);

	const rightsOptions: any[] = useMemo(
		() => [
			{
				label: t('label.can_send_receiver', 'Can Send & Receive'),
				value: TRUE_FALSE.TRUE
			},
			{
				label: t('label.not_send_receive', 'Not Send & Receive'),
				value: TRUE_FALSE.FALSE
			}
		],
		[t]
	);

	const [previousDetail, setPreviousDetail] = useState<any>({});

	const [zimbraDistributionListSubscriptionPolicy, setZimbraDistributionListSubscriptionPolicy] =
		useState<any>(subscriptionUnsubscriptionRequestOptions[0]);

	const [
		zimbraDistributionListUnsubscriptionPolicy,
		setZimbraDistributionListUnsubscriptionPolicy
	] = useState<any>(subscriptionUnsubscriptionRequestOptions[0]);

	const onSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListSubscriptionPolicy(it);
		},
		[subscriptionUnsubscriptionRequestOptions]
	);

	const onUnSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListUnsubscriptionPolicy(it);
		},
		[subscriptionUnsubscriptionRequestOptions]
	);

	const [zimbraMailStatus, setZimbraMailStatus] = useState<any>(rightsOptions[1]);

	const onRightsChange = useCallback(
		(v: any): any => {
			const it = rightsOptions.find((item: any) => item.value === v);
			setZimbraMailStatus(it);
		},
		[rightsOptions]
	);

	const getMailingList = useCallback(
		(id: string, name: string): void => {
			getDistributionList(id, name)
				.then((response) => response.json())
				.then((data) => {
					const distributionListMembers = data?.Body?.GetDistributionListResponse?.dl[0];
					if (distributionListMembers) {
						if (distributionListMembers?.id) {
							setdlId(distributionListMembers?.id);
						}
						if (distributionListMembers?.dlm) {
							const _dlm = distributionListMembers?.dlm.map((item: any) => item?._content);
							setDlm(_dlm);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								dlm: _dlm
							}));
						} else {
							setPreviousDetail((prevState: any) => ({
								...prevState,
								dlm: []
							}));
						}
						if (distributionListMembers?.owners && distributionListMembers?.owners[0]?.owner) {
							setOwnersList(distributionListMembers?.owners[0]?.owner);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								ownersList: distributionListMembers?.owners[0]?.owner
							}));
						} else {
							setPreviousDetail((prevState: any) => ({
								...prevState,
								ownersList: []
							}));
						}
						if (distributionListMembers?.a) {
							/* Get Gal Hide Information */
							const _zimbraHideInGal = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraHideInGal'
							)?._content;
							if (_zimbraHideInGal === 'TRUE') {
								setZimbraHideInGal(true);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraHideInGal: true
								}));
							} else {
								setZimbraHideInGal(false);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraHideInGal: false
								}));
							}

							const _zimbraNotes = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraNotes'
							)?._content;

							setZimbraNotes(_zimbraNotes || '');
							if (_zimbraNotes) {
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraNotes: _zimbraNotes
								}));
							} else {
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraNotes: ''
								}));
							}
							const _zimbraDistributionListSendShareMessageToNewMembers =
								distributionListMembers?.a?.find(
									(a: any) => a?.n === 'zimbraDistributionListSendShareMessageToNewMembers'
								)?._content;

							if (_zimbraDistributionListSendShareMessageToNewMembers === 'TRUE') {
								setZimbraDistributionListSendShareMessageToNewMembers(true);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraDistributionListSendShareMessageToNewMembers: true
								}));
							} else {
								setZimbraDistributionListSendShareMessageToNewMembers(false);
							}

							const _zimbraMailAlias = distributionListMembers?.a?.filter(
								(a: any) => a?.n === 'zimbraMailAlias' && a?._content !== selectedMailingList?.name
							);
							if (_zimbraMailAlias && _zimbraMailAlias.length > 0) {
								const allAlias = _zimbraMailAlias.map((item: any) => ({
									attr: 'zimbraMailAlias',
									value: item?._content
								}));
								setZimbraMailAlias(allAlias);
							}
							const _zimbraCreateTimestamp = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraCreateTimestamp'
							)?._content;
							_zimbraCreateTimestamp
								? setZimbraCreateTimestamp(_zimbraCreateTimestamp)
								: setZimbraCreateTimestamp('');

							const _zimbraDistributionListSubscriptionPolicy = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraDistributionListSubscriptionPolicy'
							)?._content;
							if (_zimbraDistributionListSubscriptionPolicy) {
								onSubscriptionChange(_zimbraDistributionListSubscriptionPolicy);
								const it = subscriptionUnsubscriptionRequestOptions.find(
									(item: any) => item.value === _zimbraDistributionListSubscriptionPolicy
								);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraDistributionListSubscriptionPolicy: it
								}));
							}

							const _zimbraDistributionListUnsubscriptionPolicy = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraDistributionListUnsubscriptionPolicy'
							)?._content;
							if (_zimbraDistributionListUnsubscriptionPolicy) {
								onUnSubscriptionChange(_zimbraDistributionListUnsubscriptionPolicy);
								const it = subscriptionUnsubscriptionRequestOptions.find(
									(item: any) => item.value === _zimbraDistributionListUnsubscriptionPolicy
								);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraDistributionListUnsubscriptionPolicy: it
								}));
							}
							/* Mail status */

							const _zimbraMailStatus = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraMailStatus'
							)?._content;
							if (_zimbraMailStatus === 'enabled') {
								onRightsChange(rightsOptions[0].value);
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraMailStatus: rightsOptions[0]
								}));
							} else {
								setPreviousDetail((prevState: any) => ({
									...prevState,
									zimbraMailStatus: rightsOptions[1]
								}));
							}
						}
					}
				});
		},
		[
			selectedMailingList?.name,
			subscriptionUnsubscriptionRequestOptions,
			onSubscriptionChange,
			onUnSubscriptionChange,
			rightsOptions,
			onRightsChange
		]
	);

	const getDistributionListMembershipList = useCallback((id: string): void => {
		getDistributionListMembership(id)
			.then((response) => response.json())
			.then((data) => {
				const members = data?.Body?.GetDistributionListMembershipResponse?.dl;
				if (members && members.length > 0) {
					const allMembers = members.map((item: any) => ({
						label: item?.name,
						background: 'gray3',
						color: 'text',
						id: item?.id,
						name: item?.name
					}));
					setDlMembershipList(allMembers);
					setPreviousDetail((prevState: any) => ({
						...prevState,
						dlMembershipList: allMembers
					}));
				} else {
					setPreviousDetail((prevState: any) => ({
						...prevState,
						dlMembershipList: []
					}));
				}
			});
	}, []);

	useEffect(() => {
		if (selectedMailingList?.a) {
			const dsName = selectedMailingList?.a?.find((a: any) => a?.n === 'displayName')?._content;
			if (dsName) {
				setDisplayName(dsName);
				setPreviousDetail((prevState: any) => ({
					...prevState,
					displayName: dsName
				}));
			} else {
				setDisplayName('');
				setPreviousDetail((prevState: any) => ({
					...prevState,
					displayName: ''
				}));
			}
		}
		setDistributionName(selectedMailingList?.name);
		setPreviousDetail((prevState: any) => ({
			...prevState,
			distributionName: selectedMailingList?.name
		}));
		getMailingList(selectedMailingList?.id, selectedMailingList?.name);
		getDistributionListMembershipList(selectedMailingList?.id);
	}, [selectedMailingList, getMailingList, getDistributionListMembershipList]);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			const allRows = dlm.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item}
					</Text>,
					''
				]
			}));
			setDlmTableRows(allRows);
		} else {
			setDlmTableRows([]);
		}
	}, [dlm]);

	useEffect(() => {
		if (ownersList && ownersList.length > 0) {
			const allRows = ownersList.map((item: any) => ({
				id: item?.name,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.name}
					</Text>
				]
			}));
			setOwnerTableRows(allRows);
		} else {
			setOwnerTableRows([]);
		}
	}, [ownersList]);

	const getSearchMembers = useCallback((value: string) => {
		const attrs = 'name,zimbraId';
		const types = 'distributionlists,dynamicgroups';
		const query = `(&(|(mail=*${value}*)(cn=*${value}*)(sn=*${value}*)(gn=*${value}*)(displayName=*${value}*)(zimbraMailAlias=*${value}*)(uid=*${value}*))(!(zimbraIsACLGroup=FALSE)))`;
		searchDirectory(attrs, types, '', query)
			.then((response) => response.json())
			.then((data) => {
				const result = data?.Body?.SearchDirectoryResponse?.dl;
				if (result && result.length > 0) {
					// setSearchMemberList(result);

					const allResult = result.map((item: any) => {
						// eslint-disable-next-line no-param-reassign
						item.label = item?.name;
						// eslint-disable-next-line no-param-reassign
						item.value = {
							label: item?.name,
							id: item?.id
						};
						// eslint-disable-next-line no-param-reassign
						return item;
					});
					setSearchMemberList(allResult);
				}
			});
	}, []);

	const onChangeChipInput = useCallback((e: any): void => {
		setDlMembershipList(e);
	}, []);

	const isEnableDeleteButton = useMemo(
		() => !!(selectedDistributionListMember.length > 0 || selectedOwnerListMember.length > 0),
		[selectedDistributionListMember, selectedOwnerListMember]
	);

	const onAddToList = useCallback((): void => {
		const attrs = '';
		const types = 'distributionlists,aliases,accounts,resources,dynamicgroups';
		const query = `(mail=${searchMailingListOrUser})`;
		searchDirectory(attrs, types, '', query, 0, 2)
			.then((response) => response.json())
			.then((data) => {
				const accountExists =
					data?.Body?.SearchDirectoryResponse?.dl || data?.Body?.SearchDirectoryResponse?.account;
				if (!!accountExists && accountExists[0]) {
					setIsShowError(false);
					if (isAddToOwnerList) {
						setOwnersList(
							ownersList.concat({ id: accountExists[0]?.id, name: accountExists[0]?.name })
						);
					} else {
						setDlm(dlm.concat(accountExists[0]?.name));
					}
					setOpenAddMailingListDialog(false);
				} else {
					setIsShowError(true);
				}
			});
	}, [isAddToOwnerList, searchMailingListOrUser, dlm, ownersList]);

	const onDeleteFromList = (): void => {
		if (selectedDistributionListMember.length > 0) {
			const _dlm = dlm.filter((item: any) => !selectedDistributionListMember.includes(item));
			setDlm(_dlm);
			setSelectedDistributionListMember([]);
		}
		if (selectedOwnerListMember.length > 0) {
			const _ownersList = ownersList.filter(
				(item: any) => !selectedOwnerListMember.includes(item?.name)
			);
			setOwnersList(_ownersList);
			setSelectedOwnerListMember([]);
		}
	};

	const updatePreviousDetail = (): void => {
		const latestData: any = {};
		latestData.displayName = displayName;
		latestData.distributionName = distributionName;
		zimbraHideInGal ? (latestData.zimbraHideInGal = true) : (latestData.zimbraHideInGal = false);
		dlm ? (latestData.dlm = dlm) : (latestData.dlm = []);
		ownersList ? (latestData.ownersList = ownersList) : (latestData.ownersList = []);
		dlMembershipList
			? (latestData.dlMembershipList = dlMembershipList)
			: (latestData.dlMembershipList = []);
		zimbraNotes ? (latestData.zimbraNotes = zimbraNotes) : (latestData.zimbraNotes = '');
		zimbraDistributionListSendShareMessageToNewMembers
			? (latestData.zimbraDistributionListSendShareMessageToNewMembers = true)
			: (latestData.zimbraDistributionListSendShareMessageToNewMember = false);
		latestData.zimbraDistributionListUnsubscriptionPolicy =
			zimbraDistributionListUnsubscriptionPolicy;
		latestData.zimbraDistributionListSubscriptionPolicy = zimbraDistributionListSubscriptionPolicy;
		latestData.zimbraMailStatus = zimbraMailStatus;

		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	const onUndo = (): void => {
		previousDetail?.displayName ? setDisplayName(previousDetail?.displayName) : setDisplayName('');
		setDistributionName(previousDetail?.distributionName);
		previousDetail?.zimbraHideInGal ? setZimbraHideInGal(true) : setZimbraHideInGal(false);
		previousDetail?.dlm !== undefined ? setDlm(previousDetail?.dlm) : setDlm([]);
		previousDetail?.ownersList !== undefined
			? setOwnersList(previousDetail?.ownersList)
			: setOwnersList([]);
		previousDetail?.dlMembershipList !== undefined
			? setDlMembershipList(previousDetail?.dlMembershipList)
			: setDlMembershipList([]);
		previousDetail?.zimbraNotes ? setZimbraNotes(previousDetail?.zimbraNotes) : setZimbraNotes('');
		previousDetail?.zimbraDistributionListSendShareMessageToNewMembers
			? setZimbraDistributionListSendShareMessageToNewMembers(true)
			: setZimbraDistributionListSendShareMessageToNewMembers(false);
		previousDetail?.zimbraDistributionListUnsubscriptionPolicy
			? setZimbraDistributionListUnsubscriptionPolicy(
					previousDetail?.zimbraDistributionListUnsubscriptionPolicy
			  )
			: setZimbraDistributionListUnsubscriptionPolicy(subscriptionUnsubscriptionRequestOptions[0]);
		previousDetail?.zimbraDistributionListSubscriptionPolicy
			? setZimbraDistributionListSubscriptionPolicy(
					previousDetail?.zimbraDistributionListSubscriptionPolicy
			  )
			: setZimbraDistributionListSubscriptionPolicy(subscriptionUnsubscriptionRequestOptions[0]);
		previousDetail?.zimbraMailStatus !== undefined
			? setZimbraMailStatus(previousDetail?.zimbraMailStatus)
			: setZimbraMailStatus(rightsOptions[1]);
		setIsDirty(false);
	};

	const callAllRequest = (requests: any): void => {
		Promise.all(requests).then((response: any) => {
			createSnackbar({
				key: 'success',
				type: 'success',
				label: t('label.changes_have_been_saved', 'The changes have been saved'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			updatePreviousDetail();
			setIsUpdateRecord(true);
		});
	};

	const onSave = (): void => {
		const attributes: any[] = [];
		const request: any[] = [];
		attributes.push({
			n: 'displayName',
			_content: displayName
		});

		attributes.push({
			n: 'description',
			_content: zimbraNotes
		});

		attributes.push({
			n: 'zimbraDistributionListUnsubscriptionPolicy',
			_content: zimbraDistributionListUnsubscriptionPolicy?.value
		});

		attributes.push({
			n: 'zimbraDistributionListSubscriptionPolicy',
			_content: zimbraDistributionListSubscriptionPolicy?.value
		});

		attributes.push({
			n: 'zimbraMailStatus',
			_content: zimbraMailStatus?.value === TRUE_FALSE.TRUE ? 'enabled' : 'disabled'
		});

		attributes.push({
			n: 'zimbraHideInGal',
			_content: zimbraHideInGal ? 'TRUE' : 'FALSE'
		});

		attributes.push({
			n: 'zimbraDistributionListSendShareMessageToNewMembers',
			_content: zimbraDistributionListSendShareMessageToNewMembers ? 'TRUE' : 'FALSE'
		});
		request.push(modifyDistributionList(selectedMailingList?.id, attributes));

		if (
			previousDetail?.distributionName !== undefined &&
			previousDetail?.distributionName !== distributionName
		) {
			request.push(renameDistributionList(selectedMailingList?.id, distributionName));
		}

		/* Member Of List */
		if (
			previousDetail?.dlMembershipList !== undefined &&
			!isEqual(previousDetail?.dlMembershipList, dlMembershipList)
		) {
			const newAddedMember: any[] = [];
			dlMembershipList.forEach((item: any) => {
				if (!previousDetail?.dlMembershipList.map((i: any) => i?.id).includes(item?.id)) {
					newAddedMember.push(item);
				}
			});

			const removeMember: any[] = [];
			previousDetail?.dlMembershipList.forEach((item: any) => {
				if (!dlMembershipList.map((i: any) => i?.id).includes(item?.id)) {
					removeMember.push(item);
				}
			});

			if (newAddedMember.length > 0) {
				newAddedMember.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: item?.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: distributionName
					};
					request.push(addDistributionListMember(id, dlmItem));
				});
			}

			if (removeMember.length > 0) {
				removeMember.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: item?.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: distributionName
					};
					request.push(removeDistributionListMember(id, dlmItem));
				});
			}
		}

		/* Members List */
		if (previousDetail?.dlm !== undefined && !isEqual(previousDetail?.dlm, dlm)) {
			const newAddedMember: any[] = [];
			dlm.forEach((item: any) => {
				if (!previousDetail?.dlm.includes(item)) {
					newAddedMember.push(item);
				}
			});
			const removeMember: any[] = [];
			previousDetail?.dlm.forEach((item: any) => {
				if (!dlm.includes(item)) {
					removeMember.push(item);
				}
			});

			if (newAddedMember.length > 0) {
				newAddedMember.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: selectedMailingList?.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: item
					};
					request.push(addDistributionListMember(id, dlmItem));
				});
			}

			if (removeMember.length > 0) {
				removeMember.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: selectedMailingList?.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: item
					};
					request.push(removeDistributionListMember(id, dlmItem));
				});
			}
		}

		/* Owner List */
		if (
			previousDetail?.ownersList !== undefined &&
			!isEqual(previousDetail?.ownersList, ownersList)
		) {
			const newAddedOwnerMember: any[] = [];
			ownersList.forEach((item: any) => {
				if (!previousDetail?.ownersList.includes(item)) {
					newAddedOwnerMember.push(item);
				}
			});
			const removeOwnerMember: any[] = [];
			previousDetail?.ownersList.forEach((item: any) => {
				if (!ownersList.includes(item)) {
					removeOwnerMember.push(item);
				}
			});

			if (newAddedOwnerMember.length > 0) {
				newAddedOwnerMember.forEach((item: any) => {
					const dl: any = {
						by: 'id',
						_content: selectedMailingList?.id
					};
					const action: any = {
						op: 'addOwners',
						owner: {
							by: 'name',
							type: 'usr',
							_content: item?.name
						}
					};
					request.push(distributionListAction(dl, action));
				});
			}

			if (removeOwnerMember.length > 0) {
				removeOwnerMember.forEach((item: any) => {
					const dl: any = {
						by: 'id',
						_content: selectedMailingList?.id
					};
					const action: any = {
						op: 'removeOwners',
						owner: {
							by: 'name',
							type: 'usr',
							_content: item?.name
						}
					};
					request.push(distributionListAction(dl, action));
				});
			}
		}
		if (request.length > 0) {
			callAllRequest(request);
		}
	};

	useEffect(() => {
		if (previousDetail?.displayName !== undefined && previousDetail?.displayName !== displayName) {
			setIsDirty(true);
		}
	}, [previousDetail?.displayName, displayName]);

	useEffect(() => {
		if (
			previousDetail?.distributionName !== undefined &&
			previousDetail?.distributionName !== distributionName
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.distributionName, distributionName]);

	useEffect(() => {
		if (
			previousDetail?.zimbraHideInGal !== undefined &&
			previousDetail?.zimbraHideInGal !== zimbraHideInGal
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.zimbraHideInGal, zimbraHideInGal]);

	useEffect(() => {
		if (previousDetail?.dlm !== undefined && !isEqual(previousDetail?.dlm, dlm)) {
			setIsDirty(true);
		}
	}, [previousDetail?.dlm, dlm]);

	useEffect(() => {
		if (
			previousDetail?.ownersList !== undefined &&
			!isEqual(previousDetail?.ownersList, ownersList)
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.ownersList, ownersList]);

	useEffect(() => {
		if (
			previousDetail?.dlMembershipList !== undefined &&
			!isEqual(previousDetail?.dlMembershipList, dlMembershipList)
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.dlMembershipList, dlMembershipList]);

	useEffect(() => {
		if (previousDetail?.zimbraNotes !== undefined && previousDetail?.zimbraNotes !== zimbraNotes) {
			setIsDirty(true);
		}
	}, [previousDetail?.zimbraNotes, zimbraNotes]);

	useEffect(() => {
		if (
			previousDetail?.zimbraDistributionListSendShareMessageToNewMembers !== undefined &&
			previousDetail?.zimbraDistributionListSendShareMessageToNewMembers !==
				zimbraDistributionListSendShareMessageToNewMembers
		) {
			setIsDirty(true);
		}
	}, [
		previousDetail?.zimbraDistributionListSendShareMessageToNewMembers,
		zimbraDistributionListSendShareMessageToNewMembers
	]);

	useEffect(() => {
		if (
			previousDetail?.zimbraDistributionListSubscriptionPolicy !== undefined &&
			previousDetail?.zimbraDistributionListSubscriptionPolicy.value !==
				zimbraDistributionListSubscriptionPolicy.value
		) {
			setIsDirty(true);
		}
	}, [
		previousDetail?.zimbraDistributionListSubscriptionPolicy,
		zimbraDistributionListSubscriptionPolicy
	]);

	useEffect(() => {
		if (
			previousDetail?.zimbraDistributionListUnsubscriptionPolicy !== undefined &&
			previousDetail?.zimbraDistributionListUnsubscriptionPolicy.value !==
				zimbraDistributionListUnsubscriptionPolicy.value
		) {
			setIsDirty(true);
		}
	}, [
		previousDetail?.zimbraDistributionListUnsubscriptionPolicy,
		zimbraDistributionListUnsubscriptionPolicy
	]);

	useEffect(() => {
		if (
			previousDetail?.zimbraMailStatus !== undefined &&
			previousDetail?.zimbraMailStatus?.value !== zimbraMailStatus.value
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.zimbraMailStatus, zimbraMailStatus]);

	useEffect(() => {
		if (openAddMailingListDialog) {
			setSearchMailingListOrUser('');
		}
	}, [openAddMailingListDialog]);

	useEffect(() => {
		if (searchMember && dlm && dlm.length > 0) {
			const allRows = dlm.filter((item: any) => item.includes(searchMember));
			const searchDlRows = allRows.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item}
					</Text>,
					''
				]
			}));
			setDlmTableRows(searchDlRows);
		}
		if (searchMember && ownersList && ownersList.length > 0) {
			const allRows = ownersList.filter((item: any) => item?.name.includes(searchMember));
			const searchOwnerRows = allRows.map((item: any) => ({
				id: item?.name,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.name}
					</Text>
				]
			}));
			setOwnerTableRows(searchOwnerRows);
		}
	}, [searchMember, dlm, ownersList]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				left: `${'max(calc(100% - 680px), 12px)'}`,
				top: '43px',
				height: 'auto',
				width: 'auto',
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				'box-shadow': '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)',
				right: 0
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="48px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{selectedMailingList?.name}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setShowEditMailingList(false)}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>
			<Container
				orientation="horizontal"
				mainAlignment="flex-end"
				crossAlignment="flex-end"
				background="gray6"
				padding={{ all: 'extralarge' }}
				height="85px"
			>
				<Padding right="small">
					{isDirty && (
						<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
					)}
				</Padding>
				{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
			</Container>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 230px)"
				background="white"
				style={{ overflow: 'auto' }}
			>
				<Row>
					<Text size="medium" weight="bold" color="gray0">
						{t('domain.list_details', 'List Details')}
					</Text>
				</Row>

				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'EyeOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.displayed_name', 'Displayed Name')}
							value={displayName}
							background="gray5"
							onChange={(e: any): any => {
								setDisplayName(e.target.value);
							}}
						/>
					</Container>
					<Container width="64px" padding={{ right: 'small', left: 'medium' }}>
						<Icon icon={'EmailOutline'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.address', 'Address')}
							value={distributionName}
							background="gray5"
							onChange={(e: any): any => {
								setDistributionName(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CheckmarkCircleOutline'} size="large" />
					</Container>
					<Container>
						<Select
							items={subscriptionUnsubscriptionRequestOptions}
							background="gray5"
							label={t('label.new_subscription_requests', 'New subscriptions requests')}
							showCheckbox={false}
							onChange={onSubscriptionChange}
							selection={zimbraDistributionListSubscriptionPolicy}
						/>
					</Container>
					<Container width="64px" padding={{ right: 'small', left: 'medium' }}>
						<Icon icon={'CloseCircleOutline'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Select
							items={subscriptionUnsubscriptionRequestOptions}
							background="gray5"
							label={t('label.unsubscribe_request', 'Unsubscription requests')}
							showCheckbox={false}
							onChange={onUnSubscriptionChange}
							selection={zimbraDistributionListUnsubscriptionPolicy}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="fit" padding={{ right: 'small' }}>
						<Icon icon={'OptionsOutline'} size="large" />
					</Container>
					<Container padding={{ right: 'small', top: 'small' }}>
						<Select
							items={rightsOptions}
							background="gray5"
							label={t('label.rights', 'Rights')}
							showCheckbox={false}
							onChange={onRightsChange}
							selection={zimbraMailStatus}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'small', bottom: 'small' }}
					>
						<Switch
							value={zimbraDistributionListSendShareMessageToNewMembers}
							label={t('label.share_manages_to_new_members', 'Share messages to new members')}
							onClick={(): void =>
								setZimbraDistributionListSendShareMessageToNewMembers(
									!zimbraDistributionListSendShareMessageToNewMembers
								)
							}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'small', bottom: 'small' }}
					>
						<Switch
							value={zimbraHideInGal}
							label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
							onClick={(): void => setZimbraHideInGal(!zimbraHideInGal)}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'PeopleOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.members', 'Members')}
							value={dlm.length}
							background="gray5"
							disabled
						/>
					</Container>
					<Container width="64px" padding={{ left: 'medium' }}>
						<Icon icon={'CornerUpRight'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.alias_in_the_list', 'Alias in the List')}
							value={zimbraMailAlias.length}
							background="gray5"
							disabled
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container width="54px">
						<Icon icon={'FingerPrintOutline'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input label={t('label.id_lbl', 'ID')} value={dlId} background="gray5" disabled />
					</Container>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CalendarOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.creation_date', 'Creation Date')}
							value={dlCreateDate}
							background="gray5"
							disabled
						/>
					</Container>
				</ListRow>
				<Row padding={{ top: 'small', bottom: 'small' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.manage_list', 'Manage List')}
					</Text>
				</Row>
				<ListRow>
					<Container padding={{ top: 'small', bottom: 'small' }}>
						<ChipInput
							placeholder={t('label.this_list_is_member_of', 'This List is member of')}
							value={dlMembershipList}
							onInputType={(e: any): void => {
								if (e.textContent && e.textContent !== '') {
									getSearchMembers(e.textContent);
								}
							}}
							options={searchMemberList}
							onChange={onChangeChipInput}
							requireUniqueChips
						/>
					</Container>
				</ListRow>
				<Row
					takeAvwidth="fill"
					mainAlignment="flex-start"
					width="100%"
					padding={{ top: 'small', bottom: 'small' }}
				>
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						height="58px"
					>
						<Row
							orientation="horizontal"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="100%"
						>
							<Row mainAlignment="flex-start" width="70%" crossAlignment="flex-start">
								<Input
									label={t('label.i_am_looking_for_member', 'I’m looking for the member...')}
									value={searchMember}
									background="gray5"
									onChange={(e: any): any => {
										setSearchMember(e.target.value);
									}}
								/>
							</Row>
							<Row width="30%" mainAlignment="flex-start" crossAlignment="flex-start">
								<Padding left="large" right="large">
									<IconButton
										iconColor="primary"
										backgroundColor="gray5"
										icon="Plus"
										height={44}
										width={44}
										onClick={(): void => {
											setOpenAddMailingListDialog(true);
										}}
									/>
								</Padding>
								<Padding right="large">
									<IconButton
										iconColor="gray6"
										backgroundColor="gray5"
										icon="EditAsNewOutline"
										height={44}
										width={44}
										disabled
									/>
								</Padding>
								<IconButton
									iconColor="error"
									backgroundColor="gray5"
									icon="Trash2Outline"
									height={44}
									width={44}
									disabled={!isEnableDeleteButton}
									onClick={onDeleteFromList}
								/>
							</Row>
						</Row>
					</Container>
				</Row>
				<ListRow>
					<Container mainAlignment="flex-start" padding={{ top: 'small', bottom: 'small' }}>
						<Table
							rows={dlmTableRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							onSelectionChange={(selected: any): void =>
								setSelectedDistributionListMember(selected)
							}
						/>
					</Container>
					<Container
						padding={{ left: 'small', top: 'small', bottom: 'small' }}
						mainAlignment="flex-start"
					>
						<Table
							rows={ownerTableRows}
							headers={ownerHeaders}
							showCheckbox={false}
							selectedRows={selectedOwnerListMember}
							onSelectionChange={(selected: any): void => setSelectedOwnerListMember(selected)}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ all: 'small' }} mainAlignment="flex-end" crossAlignment="flex-end">
						<Paginig totalItem={1} pageSize={10} setOffset={setMemberOffset} />
					</Container>
					<Container padding={{ all: 'small' }} mainAlignment="flex-end" crossAlignment="flex-end">
						<Paginig totalItem={1} pageSize={10} setOffset={setOwnerOffset} />
					</Container>
				</ListRow>
				<Row padding={{ top: 'small', bottom: 'small' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<ListRow>
					<Container>
						<Input
							value={zimbraNotes}
							background="gray5"
							onChange={(e: any): any => {
								setZimbraNotes(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
			</Container>
			<Modal
				title={
					<Trans
						i18nKey="label.would_you_like_to_add_ml"
						defaults="<bold>What would you like to add to the Mailing List?</bod>"
						components={{ bold: <strong /> }}
					/>
				}
				open={openAddMailingListDialog}
				showCloseIcon
				onClose={(): void => {
					setOpenAddMailingListDialog(false);
				}}
				size="medium"
				customFooter={
					<Container orientation="horizontal" mainAlignment="space-between">
						<Button label={t('label.help', 'Help')} type="outlined" color="primary" isSmall />
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Padding all="small">
								<Button
									label={t('label.go_back', 'Go Back')}
									color="secondary"
									size="fill"
									onClick={(): void => {
										setOpenAddMailingListDialog(false);
									}}
								/>
							</Padding>
							<Button
								label={t('label.add_it_to_list', 'Add it to the list')}
								color="primary"
								onClick={onAddToList}
								disabled={isRequstInProgress}
							/>
						</Container>
					</Container>
				}
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'medium' }}
				>
					<Text overflow="break-word" weight="regular">
						{t(
							'label.add_in_mailing_list_or_both',
							'You add another Mailing List or a User. Both of them can be a Owner of the list.'
						)}
					</Text>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						width="fill"
						padding={{ top: 'medium' }}
					>
						<Input
							value={searchMailingListOrUser}
							background="gray5"
							onChange={(e: any): void => {
								setSearchMailingListOrUser(e.target.value);
							}}
						/>
					</Container>
					{isShowError && (
						<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
							<Padding top="small">
								<Text size="extrasmall" weight="regular" color="error">
									{t(
										'label.mailing_list_already_in_list_error',
										'The Mailing List / User is already in the list'
									)}
								</Text>
							</Padding>
						</Container>
					)}

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'small' }}
					>
						<Switch
							value={isAddToOwnerList}
							label={t(
								'label.this_account_owner_of_the_list',
								'this account will be a Owner of the list'
							)}
							onClick={(): void => {
								setIsAddToOwnerList(!isAddToOwnerList);
							}}
						/>
					</Container>
				</Container>
			</Modal>
		</Container>
	);
};
export default EditMailingListView;
