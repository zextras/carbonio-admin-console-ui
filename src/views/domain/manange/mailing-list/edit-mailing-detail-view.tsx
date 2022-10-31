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
	Modal,
	Padding,
	Input,
	Table,
	Text,
	Select,
	Switch,
	Dropdown,
	Button,
	SnackbarManagerContext,
	Icon,
	ChipInput
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import moment from 'moment';
import { debounce, isEqual, sortedUniq, uniq, uniqBy } from 'lodash';
import ListRow from '../../../list/list-row';
import Paginig from '../../../components/paging';
import { getDistributionList } from '../../../../services/get-distribution-list';
import { getDistributionListMembership } from '../../../../services/get-distributionlists-membership-service';
import { getAllEmailFromString, getDateFromStr, isValidEmail } from '../../../utility/utils';
import { searchDirectory } from '../../../../services/search-directory-service';
import { modifyDistributionList } from '../../../../services/modify-distributionlist-service';
import { renameDistributionList } from '../../../../services/rename-distributionlist-service';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { ALL, EMAIL, GRP, PUB, RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { searchGal } from '../../../../services/search-gal-service';
import { getGrant } from '../../../../services/get-grant';

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
	const [dlMembershipListNames, setDlMembershipListNames] = useState<string>('');
	const [openAddMailingListDialog, setOpenAddMailingListDialog] = useState<boolean>(false);
	const [isRequstInProgress, setIsRequstInProgress] = useState<boolean>(false);
	const [isAddToOwnerList, setIsAddToOwnerList] = useState<boolean>(false);
	const [searchMailingListOrUser, setSearchMailingListOrUser] = useState<string>('');
	const [isShowError, setIsShowError] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [searchMember, setSearchMember] = useState<string>('');
	const [searchOwner, setSearchOwner] = useState<string>('');
	const [memberURL, setMemberURL] = useState<string>();
	const [ownerOfList, setOwnerOfList] = useState<any[]>([]);
	const [searchOwnerMemberOfList, setSearchOwnerMemberOfList] = useState<any[]>([]);
	const [ownerErrorMessage, setOwnerErrorMessage] = useState<string>('');
	const [zimbraIsACLGroup, setZimbraIsACLGroup] = useState<boolean>(false);
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [searchOwnerResult, setSearchOwnerResult] = useState<Array<any>>([]);
	const [isShowMemberError, setIsShowMemberError] = useState<boolean>(false);
	const [isShowOwnerError, setIsShowOwnerError] = useState<boolean>(false);
	const [memberErrorMessage, setMemberErrorMessage] = useState<string>('');
	const [allOwnerList, setAllOwnerList] = useState<Array<any>>([]);

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

	const grantTypeOptions: any[] = useMemo(
		() => [
			{
				label: t('label.everyone', 'Everyone'),
				value: PUB
			},
			{
				label: t('label.members_only', 'Members only'),
				value: GRP
			},
			{
				label: t('label.internal_users_only', 'Internal Users only'),
				value: ALL
			},
			{
				label: t('label.only_there_users', 'Only these users'),
				value: EMAIL
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
			getDistributionList(id, name).then((data) => {
				const distributionListMembers = data?.dl[0];
				if (distributionListMembers) {
					if (distributionListMembers?.id) {
						setdlId(distributionListMembers?.id);
					}
					if (distributionListMembers?.dlm) {
						const _dlm = distributionListMembers?.dlm.map((item: any) => item?._content);
						if (!selectedMailingList?.dynamic) {
							setDlm(_dlm);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								dlm: _dlm
							}));
						} else {
							const allMembers = _dlm.map((item: any) => ({
								label: item,
								background: 'gray3',
								color: 'text',
								id: item,
								name: item
							}));
							setOwnerOfList(allMembers);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								ownerOfList: allMembers
							}));
						}
					} else if (!selectedMailingList?.dynamic) {
						setPreviousDetail((prevState: any) => ({
							...prevState,
							dlm: []
						}));
					} else if (selectedMailingList?.dynamic) {
						setPreviousDetail((prevState: any) => ({
							...prevState,
							ownerOfList: []
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
						} else {
							const value = subscriptionUnsubscriptionRequestOptions[0]?.value;
							onSubscriptionChange(value);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								zimbraDistributionListSubscriptionPolicy:
									subscriptionUnsubscriptionRequestOptions[0]
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
						} else {
							const value = subscriptionUnsubscriptionRequestOptions[0]?.value;
							onUnSubscriptionChange(value);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								zimbraDistributionListUnsubscriptionPolicy:
									subscriptionUnsubscriptionRequestOptions[0]
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

						const _memberURL = distributionListMembers?.a?.find(
							(a: any) => a?.n === 'memberURL'
						)?._content;

						if (_memberURL) {
							setMemberURL(_memberURL);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								memberURL: _memberURL
							}));
						} else if (selectedMailingList?.dynamic) {
							setPreviousDetail((prevState: any) => ({
								...prevState,
								memberURL: ''
							}));
						}

						const _zimbraIsACLGroup = distributionListMembers?.a?.find(
							(a: any) => a?.n === 'zimbraIsACLGroup'
						)?._content;
						if (_zimbraIsACLGroup) {
							setZimbraIsACLGroup(_zimbraIsACLGroup === 'TRUE');
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
			onRightsChange,
			selectedMailingList?.dynamic
		]
	);

	const getDistributionListMembershipList = useCallback((id: string): void => {
		getDistributionListMembership(id).then((data) => {
			const members = data?.dl;
			if (members && members.length > 0) {
				const allMembers = members.map((item: any) => ({
					label: item?.name,
					background: 'gray3',
					color: 'text',
					id: item?.id,
					name: item?.name
				}));
				setDlMembershipList(allMembers);
				setDlMembershipListNames(allMembers.map((item: any) => item?.name).join(', '));
				setPreviousDetail((prevState: any) => ({
					...prevState,
					dlMembershipList: allMembers
				}));
			} else {
				setPreviousDetail((prevState: any) => ({
					...prevState,
					dlMembershipList: []
				}));
				setDlMembershipListNames('');
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
		if (!selectedMailingList?.dynamic) {
			getDistributionListMembershipList(selectedMailingList?.id);
		}
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

	const _allOwnerLists = useMemo(
		() =>
			ownersList.map((item: any) => ({
				id: item?.id,
				name: item?.name,
				type: item?.type
			})),
		[ownersList]
	);

	const onAddToList = useCallback((): void => {
		const attrs = '';
		const types = 'distributionlists,aliases,accounts,resources,dynamicgroups';
		const query = `(mail=${searchMailingListOrUser})`;
		searchDirectory(attrs, types, '', query, 0, 2).then((data) => {
			const accountExists = data?.dl || data?.account;
			if (!!accountExists && accountExists[0]) {
				setIsShowError(false);
				if (isAddToOwnerList) {
					if (ownersList.find((item: any) => item?.name === searchMailingListOrUser)) {
						setIsShowError(true);
						setOwnerErrorMessage(
							t(
								'label.mailing_list_already_in_list_error',
								'The Mailing List / User is already in the list'
							)
						);
					} else {
						setOwnersList(
							ownersList.concat({ id: accountExists[0]?.id, name: accountExists[0]?.name })
						);
						setOpenAddMailingListDialog(false);
					}
				} else if (dlm.find((item: any) => item === searchMailingListOrUser)) {
					setIsShowError(true);
					setOwnerErrorMessage(
						t(
							'label.mailing_list_already_in_list_error',
							'The Mailing List / User is already in the list'
						)
					);
				} else {
					setDlm(dlm.concat(accountExists[0]?.name));
					setOpenAddMailingListDialog(false);
				}
			} else {
				setIsShowError(true);
				setOwnerErrorMessage(
					t(
						'label.mailing_list_not_exists_error_msg',
						'The Mailing List / User does not exist. Please check the spelling and try again.'
					)
				);
			}
		});
	}, [t, isAddToOwnerList, searchMailingListOrUser, dlm, ownersList]);

	const onDeleteFromList = (): void => {
		if (selectedDistributionListMember.length > 0) {
			const _dlm = dlm.filter((item: any) => !selectedDistributionListMember.includes(item));
			setDlm(_dlm);
			setSelectedDistributionListMember([]);
		}
	};

	const onDeleteFromOwnerList = useCallback(() => {
		if (selectedOwnerListMember.length > 0) {
			const _ownersList = ownersList.filter(
				(item: any) => !selectedOwnerListMember.includes(item?.name)
			);
			setOwnersList(_ownersList);
			setSelectedOwnerListMember([]);
		}
	}, [selectedOwnerListMember, ownersList]);

	const [grantType, setGrantType] = useState<any>(grantTypeOptions[0]);
	const [grantEmails, setGrantEmails] = useState<any>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);

	const onGrantTypeChange = useCallback(
		(v: any): any => {
			const it = grantTypeOptions.find((item: any) => item.value === v);
			setGrantType(it);
		},
		[grantTypeOptions]
	);

	const getGrantML = useCallback(() => {
		getGrant('name', 'dl', selectedMailingList?.name)
			.then((data: any) => {
				if (data && data?.grant && Array.isArray(data?.grant)) {
					const grant = data?.grant;
					if (grant.length > 1) {
						onGrantTypeChange(EMAIL);
						const emails: Array<any> = [];
						grant.forEach((grItem: any) => {
							emails.push({
								anotherProp: 'prop1',
								avatarIcon: 'People',
								label: grItem?.grantee[0]?.name
							});
						});
						setGrantEmails(emails);
						const it = grantTypeOptions.find((item: any) => item.value === EMAIL);
						setPreviousDetail((prevState: any) => ({
							...prevState,
							grantType: it
						}));
						setPreviousDetail((prevState: any) => ({
							...prevState,
							grantEmails: emails
						}));
					} else if (grant.length === 1) {
						const granteeType = grant[0]?.grantee[0]?.type;
						if (
							grant[0]?.grantee[0]?.name &&
							grant[0]?.grantee[0]?.name !== selectedMailingList?.name
						) {
							onGrantTypeChange(EMAIL);
							const it = grantTypeOptions.find((item: any) => item.value === EMAIL);
							const emails = [
								{
									anotherProp: 'prop1',
									avatarIcon: 'People',
									label: grant[0]?.grantee[0]?.name
								}
							];
							setGrantEmails(emails);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								grantType: it
							}));
							setPreviousDetail((prevState: any) => ({
								...prevState,
								grantEmails: emails
							}));
						} else {
							onGrantTypeChange(granteeType);
							const it = grantTypeOptions.find((item: any) => item.value === granteeType);
							setPreviousDetail((prevState: any) => ({
								...prevState,
								grantType: it
							}));
						}
					}
				} else {
					const it = grantTypeOptions.find((item: any) => item.value === PUB);
					setPreviousDetail((prevState: any) => ({
						...prevState,
						grantType: it
					}));
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, t, selectedMailingList?.name, onGrantTypeChange, grantTypeOptions]);
	useEffect(() => {
		getGrantML();
	}, [getGrantML]);

	const onEmailAdd = useCallback((v) => {
		setGrantEmails(v);
		setIsDirty(true);
	}, []);

	const searchEmailFromGal = useCallback((searchKeyword) => {
		searchGal(searchKeyword).then((data) => {
			const contactList = data?.cn;
			if (contactList) {
				let result: any[] = [];
				result = contactList.map((item: any): any => ({
					id: item?.id,
					address: item?._attrs?.email,
					lastName: item?._attrs?.email,
					firstName: item?._attrs?.email,
					label: item?._attrs?.email,
					value: {
						label: item?._attrs?.email,
						anotherProp: 'prop1',
						avatarIcon: 'People'
					}
				}));
				setGrantEmailsList(result);
			} else {
				setGrantEmailsList([]);
			}
		});
	}, []);

	useEffect(() => {
		if (
			previousDetail?.grantType !== undefined &&
			previousDetail?.grantType?.value !== grantType?.value
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.grantType, grantType]);

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

		if (selectedMailingList?.dynamic) {
			latestData.memberURL = memberURL;
			ownerOfList ? (latestData.ownerOffset = ownerOfList) : (latestData.ownerOffset = []);
		}

		latestData.grantType = grantType;
		latestData.grantEmails = grantEmails;
		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	const onUndo = (): void => {
		previousDetail?.displayName ? setDisplayName(previousDetail?.displayName) : setDisplayName('');
		if (selectedMailingList?.dynamic) {
			previousDetail?.memberURL ? setMemberURL(previousDetail?.memberURL) : setMemberURL('');
		}
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
		if (selectedMailingList?.dynamic) {
			previousDetail?.ownerOfList !== undefined
				? setOwnerOfList(previousDetail?.ownerOfList)
				: setOwnerOfList([]);
		}

		setGrantType(previousDetail?.grantType);
		previousDetail?.grantEmails !== undefined
			? setGrantEmails(previousDetail?.grantEmails)
			: setGrantEmails([]);
		setIsDirty(false);
	};

	const callAllRequest = (requests: any): void => {
		Promise.all(requests)
			.then((response: any) => Promise.all(response))
			.then((data: any) => {
				// eslint-disable-next-line no-shadow
				let isError = false;
				let errorMessage = '';
				data.forEach((item: any) => {
					if (item?.Fault) {
						isError = true;
						errorMessage = item?.Fault?.Reason?.Text;
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
					updatePreviousDetail();
					setIsUpdateRecord(true);
				} else {
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
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const getOwnerType = useCallback(
		(email?: string): any => {
			let type = 'email';
			const all = [..._allOwnerLists, ...allOwnerList];
			all.forEach((item: any) => {
				if (item?.id && item?.type && item?.email === email) {
					type = item?.type === 'group' || item?.type === 'grp' ? 'grp' : 'usr';
				}
			});
			return type;
		},
		[allOwnerList, _allOwnerLists]
	);

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
		if (!selectedMailingList?.dynamic) {
			attributes.push({
				n: 'zimbraDistributionListSendShareMessageToNewMembers',
				_content: zimbraDistributionListSendShareMessageToNewMembers ? 'TRUE' : 'FALSE'
			});
		}

		if (selectedMailingList?.dynamic && !zimbraIsACLGroup) {
			attributes.push({
				n: 'memberURL',
				_content: memberURL
			});
		}

		attributes.push({
			n: 'zimbraNotes',
			_content: zimbraNotes
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
							type: getOwnerType(item?.name),
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
							type: getOwnerType(item?.name),
							_content: item?.name
						}
					};
					request.push(distributionListAction(dl, action));
				});
			}
		}

		/* Dynamic Member List */
		if (
			selectedMailingList?.dynamic &&
			previousDetail?.ownerOfList !== undefined &&
			!isEqual(previousDetail?.ownerOfList, ownerOfList)
		) {
			const newAddedMember: any[] = [];
			ownerOfList.forEach((item: any) => {
				if (!previousDetail?.ownerOfList.map((i: any) => i?.id).includes(item?.id)) {
					newAddedMember.push(item);
				}
			});

			const removeMember: any[] = [];
			previousDetail?.ownerOfList.forEach((item: any) => {
				if (!ownerOfList.map((i: any) => i?.id).includes(item?.id)) {
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
						_content: distributionName
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
						_content: distributionName
					};
					request.push(removeDistributionListMember(id, dlmItem));
				});
			}
		}

		let dl: any = {};
		let action: any = {};
		if (grantType?.value === PUB) {
			dl = { by: 'name', _content: selectedMailingList?.name };
			action = {
				op: 'setRights',
				right: { right: 'sendToDistList', grantee: [{ type: 'pub' }] }
			};
		} else if (grantType?.value === GRP) {
			dl = { by: 'name', _content: selectedMailingList?.name };
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: [{ type: 'grp', by: 'name', _content: selectedMailingList?.name }]
				}
			};
		} else if (grantType?.value === ALL) {
			dl = { by: 'name', _content: selectedMailingList?.name };
			action = {
				op: 'setRights',
				right: { right: 'sendToDistList', grantee: [{ type: 'all' }] }
			};
		} else if (grantType?.value === EMAIL) {
			dl = { by: 'name', _content: selectedMailingList?.name };
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: grantEmails.map((item: any) => ({
						type: 'email',
						by: 'name',
						_content: item?.label
					}))
				}
			};
		}
		request.push(distributionListAction(dl, action));

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
			previousDetail?.ownerOfList !== undefined &&
			!isEqual(previousDetail?.ownerOfList, ownerOfList)
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.ownerOfList, ownerOfList]);

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
		if (previousDetail?.memberURL !== undefined && previousDetail?.memberURL !== memberURL) {
			setIsDirty(true);
		}
	}, [previousDetail?.memberURL, memberURL]);

	useEffect(() => {
		if (openAddMailingListDialog) {
			setSearchMailingListOrUser('');
			setIsShowError(false);
		}
	}, [openAddMailingListDialog]);

	useEffect(() => {
		if (selectedMailingList?.dynamic) {
			setIsAddToOwnerList(true);
		}
	}, [selectedMailingList?.dynamic]);

	const searchMemberItems = searchMemberResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
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
					setSearchMember(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	const searchOwnerList = searchOwnerResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
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
					setSearchOwner(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	const getSearchMemberList = useCallback((mem) => {
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
		const types = 'accounts,distributionlists,aliases';
		const query = `(&(!(zimbraAccountStatus=closed))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)(uid=*${mem}*)(zimbraDomainName=*${mem}*)(uid=*${mem}*)))`;

		searchDirectory(attrs, types, '', query, 0, RECORD_DISPLAY_LIMIT, 'name').then((data) => {
			const result: any[] = [];
			const dl = data?.dl;
			const account = data?.account;
			const alias = data?.alias;
			if (dl) {
				dl.map((item: any) => result.push(item));
			}
			if (account) {
				account.map((item: any) => result.push(item));
			}
			if (alias) {
				alias.map((item: any) => result.push(item));
			}
			setSearchMemberResult(result);
		});
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchMemberCall = useCallback(
		debounce((mem) => {
			getSearchMemberList(mem);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		if (searchMember !== '') {
			searchMemberCall(searchMember);
		}
	}, [searchMember, searchMemberCall]);

	const onAdd = useCallback((): void => {
		if (searchMember !== '') {
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(searchMember)
				? getAllEmailFromString(searchMember)
				: [searchMember];
			if (allEmails !== null && allEmails !== undefined) {
				const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
				if (inValidEmailAddress && inValidEmailAddress.length > 0) {
					setIsShowMemberError(true);
					setMemberErrorMessage(
						t(
							'label.mailing_list_not_exists_error_msg',
							'The Mailing List / User does not exist. Please check the spelling and try again.'
						)
					);
				} else if (dlm.find((item: any) => item === searchMember)) {
					setIsShowMemberError(true);
					setMemberErrorMessage(
						t(
							'label.mailing_list_already_in_list_error',
							'The Mailing List / User is already in the list'
						)
					);
				} else {
					const sortedList = sortedUniq(allEmails);
					setDlm(uniq(dlm.concat(sortedList)));
					setIsShowMemberError(false);
					setSearchMember('');
					setMemberErrorMessage('');
				}
			} else if (allEmails === undefined) {
				setMemberErrorMessage(
					t(
						'label.mailing_list_not_exists_error_msg',
						'The Mailing List / User does not exist. Please check the spelling and try again.'
					)
				);
				setIsShowMemberError(true);
			}
		}
	}, [searchMember, t, dlm]);

	const onAddOwner = useCallback((): void => {
		if (searchOwner !== '') {
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(searchOwner)
				? getAllEmailFromString(searchOwner)
				: [searchOwner];
			if (allEmails !== null && allEmails !== undefined) {
				const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
				if (inValidEmailAddress && inValidEmailAddress.length > 0) {
					setIsShowOwnerError(true);
					setOwnerErrorMessage(
						t(
							'label.mailing_list_not_exists_error_msg',
							'The Mailing List / User does not exist. Please check the spelling and try again.'
						)
					);
				} else if (ownersList.find((item: any) => item?.name === searchOwner)) {
					setIsShowOwnerError(true);
					setOwnerErrorMessage(
						t(
							'label.mailing_list_already_in_list_error',
							'The Mailing List / User is already in the list'
						)
					);
				} else {
					setIsShowOwnerError(false);
					const sortedList = sortedUniq(allEmails);
					setOwnersList(
						uniq(ownersList.concat(sortedList.map((item: any) => ({ name: item, id: item }))))
					);
					setSearchOwner('');
					setMemberErrorMessage('');
				}
			} else if (allEmails === undefined) {
				setIsShowOwnerError(true);
				setOwnerErrorMessage(
					t(
						'label.mailing_list_not_exists_error_msg',
						'The Mailing List / User does not exist. Please check the spelling and try again.'
					)
				);
			}
		}
	}, [searchOwner, t, ownersList]);

	const getSearchOwnerList = useCallback(
		(searchKeyword) => {
			searchGal(searchKeyword).then((data) => {
				const contactList = data?.cn;
				if (contactList) {
					let result: any[] = [];
					result = contactList.map((item: any): any => ({
						id: item?.id,
						name: item?._attrs?.email
					}));
					setAllOwnerList(
						uniqBy(
							allOwnerList.concat(
								contactList.map((item: any) => ({
									id: item?.id,
									name: item?._attrs?.email,
									type: item?._attrs?.type
								}))
							),
							'id'
						)
					);
					setSearchOwnerResult(result);
				} else {
					setSearchOwnerResult([]);
				}
			});
		},
		[allOwnerList]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchOwnerCall = useCallback(
		debounce((mem) => {
			getSearchOwnerList(mem);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		if (searchOwner !== '') {
			searchOwnerCall(searchOwner);
		}
	}, [searchOwner, searchOwnerCall]);

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
				height="56px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{selectedMailingList?.name} (
						{selectedMailingList?.dynamic
							? t('label.dynamic', 'Dynamic')
							: t('label.standard', 'Standard')}
						)
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onUndo}
										height={36}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button
									label={t('label.save', 'Save')}
									color="primary"
									onClick={onSave}
									height={36}
								/>
							)}
						</Container>
					)}
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
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 145px)"
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
						padding={{ top: 'large', bottom: 'medium' }}
					>
						<Switch
							value={zimbraDistributionListSendShareMessageToNewMembers}
							label={t(
								'label.send_new_members_notification_for_share_assigned_to_this_group',
								'Send new members a notification for the share/delegation assigned to this group'
							)}
							onClick={(): void => {
								setIsDirty(true);
								setZimbraDistributionListSendShareMessageToNewMembers(
									!zimbraDistributionListSendShareMessageToNewMembers
								);
							}}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', bottom: 'medium' }}
					>
						<Switch
							value={zimbraHideInGal}
							label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
							onClick={(): void => {
								setIsDirty(true);
								setZimbraHideInGal(!zimbraHideInGal);
							}}
						/>
					</Container>
				</ListRow>
				{selectedMailingList?.dynamic && (
					<ListRow>
						<Container padding={{ top: 'small', bottom: 'small' }} orientation="horizontal">
							<Container width="fit" padding={{ right: 'small' }}>
								<Icon icon={'Link2Outline'} size="large" />
							</Container>
							<Container>
								<Input
									label={t('label.list_url', "Mailing List's URL")}
									value={memberURL}
									background="gray5"
									onChange={(e: any): any => {
										setMemberURL(e.target.value);
									}}
									disabled={zimbraIsACLGroup}
								/>
							</Container>
						</Container>
					</ListRow>
				)}
				<ListRow>
					<Container padding={{ top: 'small', bottom: 'small' }} orientation="horizontal">
						<Container width="54px">
							<Icon icon={'PeopleOutline'} size="large" />
						</Container>
						<Container padding={{ all: 'small' }}>
							<Input
								label={t('label.members', 'Members')}
								value={dlm.length}
								background="gray5"
								disabled
							/>
						</Container>
						<Container width="64px" padding={{ right: 'medium' }}>
							<Icon icon={'CornerUpRight'} size="large" />
						</Container>
						<Container>
							<Input
								label={t('label.alias_in_the_list', 'Alias in the List')}
								value={zimbraMailAlias.length}
								background="gray5"
								disabled
							/>
						</Container>
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ bottom: 'small' }} orientation="horizontal">
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
					</Container>
				</ListRow>
				<Row padding={{ top: 'small', bottom: 'medium' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<ListRow>
					<Container padding={{ top: 'small', bottom: 'medium' }}>
						<Input
							value={zimbraNotes}
							label={t(
								'label.note_label',
								'Write something that will easily make you remember this element'
							)}
							background="gray5"
							onChange={(e: any): any => {
								setZimbraNotes(e.target.value);
							}}
						/>
					</Container>
				</ListRow>

				{!selectedMailingList?.dynamic && (
					<>
						<Row padding={{ top: 'small', bottom: 'small' }}>
							<Text size="medium" weight="bold" color="gray0">
								{t('label.who_is_in_this_list', "Who's in this list?")}
							</Text>
						</Row>
						<ListRow>
							<Container padding={{ top: 'small', bottom: 'small' }}>
								<Input
									label={t('label.this_list_is_member_of', 'This List is part of')}
									value={dlMembershipListNames}
									background="gray5"
									readOnly
								/>
							</Container>
						</ListRow>
					</>
				)}

				{!selectedMailingList?.dynamic && (
					<>
						<Row padding={{ top: 'small', bottom: 'medium' }}>
							<Text size="medium" weight="bold" color="gray0">
								{t('label.accounts', 'Accounts')}
							</Text>
						</Row>
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-start"
							width="100%"
							padding={{ top: 'small', bottom: isShowMemberError ? 'extrasmall' : 'small' }}
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
									<Row mainAlignment="flex-start" width="60%" crossAlignment="flex-start">
										<Dropdown
											items={searchMemberItems}
											placement="bottom-start"
											maxWidth="300px"
											disableAutoFocus
											width="265px"
											style={{
												width: '100%'
											}}
										>
											<Input
												label={t(
													'label.type_accounts_paste_them_here',
													'Type the Accounts or paste them here'
												)}
												value={searchMember}
												background="gray5"
												onChange={(e: any): any => {
													setSearchMember(e.target.value);
												}}
												hasError={isShowMemberError}
											/>
										</Dropdown>
									</Row>

									<Row width="40%" mainAlignment="flex-start" crossAlignment="flex-start">
										<Padding left="large" right="large">
											<Button
												type="outlined"
												key="add-button"
												label={t('label.add', 'Add')}
												color="primary"
												icon="PlusOutline"
												height={44}
												iconPlacement="right"
												onClick={onAdd}
												disabled={searchMember === ''}
											/>
										</Padding>

										<Button
											type="outlined"
											key="add-button"
											label={t('label.delete', 'Delete')}
											color="error"
											icon="Trash2Outline"
											iconPlacement="right"
											disabled={selectedDistributionListMember.length === 0}
											height={44}
											onClick={onDeleteFromList}
										/>
									</Row>
								</Row>
							</Container>
						</Row>
						{isShowMemberError && (
							<Row>
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding>
										<Text size="extrasmall" weight="regular" color="error">
											{memberErrorMessage}
										</Text>
									</Padding>
								</Container>
							</Row>
						)}
					</>
				)}
				<ListRow>
					{!selectedMailingList?.dynamic && (
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
					)}
				</ListRow>
				<ListRow>
					{!selectedMailingList?.dynamic && (
						<Container
							padding={{ all: 'small' }}
							mainAlignment="flex-end"
							crossAlignment="flex-end"
						>
							<Paginig totalItem={1} pageSize={10} setOffset={setMemberOffset} />
						</Container>
					)}
				</ListRow>

				<Row padding={{ top: 'small', bottom: 'medium' }}>
					<Text
						size="medium"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						weight="bold"
						color="gray0"
					>
						{t('label.owners_settings_lbl', 'Owners’ Settings')}
					</Text>
				</Row>
				<Row>
					<Text
						size="medium"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						color="secondary"
						style={{ 'white-space': 'normal' }}
						overflow="break-word"
					>
						{t(
							'label.owners_description_msg_1',
							'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
						)}
					</Text>
				</Row>

				<ListRow>
					<Container>
						<Select
							items={grantTypeOptions}
							background="gray5"
							label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
							showCheckbox={false}
							onChange={onGrantTypeChange}
							selection={grantType}
						/>
					</Container>

					<Container padding={{ all: 'small' }}>
						<ChipInput
							defaultValue={grantEmails}
							value={grantEmails}
							placeholder={t('label.type_in_the_mails', 'Type in the mails')}
							options={grantEmailsList}
							requireUniqueChips
							onChange={onEmailAdd}
							background="gray5"
							disabled={grantType?.value !== EMAIL}
							onInputType={(e: any): void => {
								searchEmailFromGal(e?.textContent);
							}}
						/>
					</Container>
				</ListRow>

				<Row
					takeAvwidth="fill"
					mainAlignment="flex-start"
					width="100%"
					padding={{ top: 'small', bottom: isShowOwnerError ? 'extrasmall' : 'small' }}
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
							<Row mainAlignment="flex-start" width="60%" crossAlignment="flex-start">
								<Dropdown
									items={searchOwnerList}
									placement="bottom-start"
									maxWidth="300px"
									disableAutoFocus
									width="265px"
									style={{
										width: '100%'
									}}
								>
									<Input
										label={t(
											'label.type_accounts_paste_them_here',
											'Type the Accounts or paste them here'
										)}
										backgroundColor="gray5"
										size="medium"
										value={searchOwner}
										onChange={(e: any): void => {
											setSearchOwner(e.target.value);
										}}
										hasError={isShowOwnerError}
									/>
								</Dropdown>
							</Row>
							<Row width="40%" mainAlignment="flex-start" crossAlignment="flex-start">
								<Padding left="large" right="large">
									<Button
										type="outlined"
										key="add-button"
										label={t('label.add', 'Add')}
										color="primary"
										icon="PlusOutline"
										height={44}
										iconPlacement="right"
										onClick={onAddOwner}
										disabled={searchOwner === ''}
									/>
								</Padding>

								<Button
									type="outlined"
									key="add-button"
									label={t('label.delete', 'Delete')}
									color="error"
									icon="Trash2Outline"
									iconPlacement="right"
									disabled={selectedOwnerListMember.length === 0}
									height={44}
									onClick={onDeleteFromOwnerList}
								/>
							</Row>
						</Row>
					</Container>
					{isShowOwnerError && (
						<Row>
							<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
								<Padding>
									<Text size="extrasmall" weight="regular" color="error">
										{ownerErrorMessage}
									</Text>
								</Padding>
							</Container>
						</Row>
					)}
				</Row>

				<ListRow>
					<Container
						padding={{
							left: !selectedMailingList?.dynamic ? 'small' : '',
							top: 'small',
							bottom: 'small'
						}}
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
					<Container
						padding={{ all: 'small' }}
						mainAlignment={selectedMailingList?.dynamic ? 'flex-start' : 'flex-end'}
						crossAlignment={selectedMailingList?.dynamic ? 'flex-start' : 'flex-end'}
					>
						<Paginig totalItem={1} pageSize={10} setOffset={setOwnerOffset} />
					</Container>
				</ListRow>
			</Container>
			<Modal
				title={
					<Trans
						i18nKey="label.would_you_like_to_add_ml"
						defaults="<bold>Who would you like to add to the Mailing List?</bold>"
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
								label={t('label.add_to_the_list', 'Add to the list')}
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
							hasError={isShowError}
							label={t('label.mailing_list_user', 'Mailing List / User')}
						/>
					</Container>
					{isShowError && (
						<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
							<Padding top="small">
								<Text size="extrasmall" weight="regular" color="error">
									{ownerErrorMessage}
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
							disabled={selectedMailingList?.dynamic}
						/>
					</Container>
				</Container>
			</Modal>
			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};
export default EditMailingListView;
