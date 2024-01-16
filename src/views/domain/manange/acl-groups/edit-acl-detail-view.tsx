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
	Switch,
	Dropdown,
	Button,
	SnackbarManagerContext,
	Icon
} from '@zextras/carbonio-design-system';
import { debounce, isEqual, sortedUniq, uniq, uniqBy, differenceBy } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import helmetLogo from '../../../../assets/helmet_logo.svg';
import { ALL, EMAIL, GRP, PUB, RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { addAclListAliasRequest } from '../../../../services/add-acl-list-alias';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { deleteAclListAliasRequest } from '../../../../services/delete-acl-list-alias';
import { deleteDistributionList } from '../../../../services/delete-distribution-list';
import { distributionListAction } from '../../../../services/distribution-list-action-service';
import { getDistributionList } from '../../../../services/get-distribution-list';
import { getDistributionListMembership } from '../../../../services/get-distributionlists-membership-service';
import { getGrant } from '../../../../services/get-grant';
import { modifyDistributionList } from '../../../../services/modify-distributionlist-service';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import { renameDistributionList } from '../../../../services/rename-distributionlist-service';
import { searchDirectory } from '../../../../services/search-directory-service';
import { getDomainList } from '../../../../services/search-domain-service';
import { searchGal } from '../../../../services/search-gal-service';
import { useDomainStore } from '../../../../store/domain/store';
import { useStickyBarStore } from '../../../../store/sticky-bar/store';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import Displayer from '../../../components/displayer';
import OverlayDivision from '../../../components/overlayDivision';
import Paging from '../../../components/paging';
import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { getAllEmailFromString, isValidEmail } from '../../../utility/utils';

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

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 40.4rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const EditAclListView: FC<any> = ({
	selectedAclList,
	setShowEditAclList,
	setIsUpdateRecord,
	getAclLists
}) => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [memberOffset, setMemberOffset] = useState<number>(0);
	const [ownerOffset, setOwnerOffset] = useState<number>(0);
	const [displayName, setDisplayName] = useState<string>('');
	const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
	const { isSticky, setIsSticky } = useStickyBarStore();
	const [distributionName, setDistributionName] = useState<string>('');
	const [distributionDomain, setDistributionDomain] = useState<string>('');
	const [
		zimbraDistributionListSendShareMessageToNewMembers,
		setZimbraDistributionListSendShareMessageToNewMembers
	] = useState<boolean>(false);

	const [zimbraHideInGal, setZimbraHideInGal] = useState<boolean>(false);
	const [zimbraDefaultMailAlias, setDefaultZimbraMailAlias] = useState<any>([]);
	const [zimbraMailAlias, setZimbraMailAlias] = useState<any>([]);
	const [dlm, setDlm] = useState<any[]>([]);
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [description, setDescription] = useState<string>('');
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
	const [openAddAclListDialog, setOpenAddAclListDialog] = useState<boolean>(false);
	const [isRequstInProgress, setIsRequstInProgress] = useState<boolean>(false);
	const [isAddToOwnerList, setIsAddToOwnerList] = useState<boolean>(false);
	const [searchAclListOrUser, setSearchAclListOrUser] = useState<string>('');
	const [isShowError, setIsShowError] = useState<boolean>(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [searchMember, setSearchMember] = useState<string>('');
	const [searchOwner, setSearchOwner] = useState<string>('');
	const [memberURL, setMemberURL] = useState<string>();
	const [ownerOfList, setOwnerOfList] = useState<any[]>([]);
	const [ownerErrorMessage, setOwnerErrorMessage] = useState<string | null>('');
	const [zimbraIsACLGroup, setZimbraIsACLGroup] = useState<boolean>(false);
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [searchOwnerResult, setSearchOwnerResult] = useState<Array<any>>([]);
	const [isShowMemberError, setIsShowMemberError] = useState<boolean>(false);
	const [isShowOwnerError, setIsShowOwnerError] = useState<boolean>(false);
	const [memberErrorMessage, setMemberErrorMessage] = useState<string | null>('');
	const [allOwnerList, setAllOwnerList] = useState<Array<any>>([]);
	const domainList = useDomainStore((state) => state.domainList);
	const setDomainListStore = useDomainStore((state) => state.setDomainList);
	const [isLoading, setIsLoading] = useState(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.members', 'Members'),
				width: '80%',
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
				label: t('label.cant_send_receiver', "Can't Send & Receive"),
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

	type DomainResponse = {
		domain: [
			{
				name: string;
				id: string;
				a: { n: string; _content: string }[];
			}
		];
		more: boolean;
		searchTotal: number;
		_jsns: string;
	};
	const getDomainLists = useCallback(
		(offset: number): void => {
			getDomainList('', offset).then((data) => {
				const searchResponse: DomainResponse = data;
				if (!!searchResponse && searchResponse?.searchTotal > 0) {
					if (searchResponse?.domain?.length) {
						setDomainListStore([...domainList, ...searchResponse.domain]);
						if (searchResponse?.more) {
							getDomainLists(offset + 50);
						}
					}
				} else {
					setDomainListStore([]);
				}
			});
		},
		[domainList, setDomainListStore]
	);

	useEffect(() => {
		if (!domainList?.length) {
			getDomainLists(0);
		}
	}, [domainList, getDomainLists]);

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

	const getAclList = useCallback(
		// eslint-disable-next-line sonarjs/cognitive-complexity
		(id: string, name: string): void => {
			getDistributionList(id, name).then((data) => {
				const distributionListMembers = data?.dl[0];
				if (distributionListMembers) {
					if (distributionListMembers?.id) {
						setdlId(distributionListMembers?.id);
					}
					if (distributionListMembers?.dlm) {
						const _dlm = distributionListMembers?.dlm.map((item: any) => item?._content);
						if (!selectedAclList?.dynamic) {
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
					} else if (!selectedAclList?.dynamic) {
						setPreviousDetail((prevState: any) => ({
							...prevState,
							dlm: []
						}));
					} else if (selectedAclList?.dynamic) {
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

						const _description = distributionListMembers?.a?.find(
							(a: any) => a?.n === 'description'
						)?._content;

						setDescription(_description || '');
						if (_description) {
							setPreviousDetail((prevState: any) => ({
								...prevState,
								description: _description
							}));
						} else {
							setPreviousDetail((prevState: any) => ({
								...prevState,
								description: ''
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
							(a: any) => a?.n === 'zimbraMailAlias' && a?._content !== selectedAclList?.name
						);
						if (_zimbraMailAlias && _zimbraMailAlias.length > 0) {
							const allAlias = _zimbraMailAlias.map((ele: any) => ({ label: ele?._content }));
							setZimbraMailAlias(allAlias);
							setDefaultZimbraMailAlias(allAlias);
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
						} else if (selectedAclList?.dynamic) {
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
			selectedAclList?.name,
			subscriptionUnsubscriptionRequestOptions,
			onSubscriptionChange,
			onUnSubscriptionChange,
			rightsOptions,
			onRightsChange,
			selectedAclList?.dynamic
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
		if (selectedAclList?.a) {
			const dsName = selectedAclList?.a?.find((a: any) => a?.n === 'displayName')?._content;
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
		setDistributionName(selectedAclList?.name?.split('@')?.[0]);
		setDistributionDomain(selectedAclList?.name?.split('@')?.[1]);
		setPreviousDetail((prevState: any) => ({
			...prevState,
			distributionName: selectedAclList?.name?.split('@')?.[0]
		}));
		getAclList(selectedAclList?.id, selectedAclList?.name);
		if (!selectedAclList?.dynamic) {
			getDistributionListMembershipList(selectedAclList?.id);
		}
	}, [selectedAclList, getAclList, getDistributionListMembershipList]);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			const allRows = dlm.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="light"
						key={item}
						color="gray0"
						onClick={(): void => {
							setSelectedDistributionListMember([item]);
						}}
					>
						{item}
					</Text>
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
					<Text
						size="medium"
						weight="light"
						key={item?.id}
						color="gray0"
						onClick={(): void => {
							setSelectedOwnerListMember([item?.name]);
						}}
					>
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
		const query = `(mail=${searchAclListOrUser})`;
		searchDirectory(attrs, types, '', query, 0, 2).then((data) => {
			const accountExists = data?.dl || data?.account;
			if (!!accountExists && accountExists[0]) {
				setIsShowError(false);
				if (isAddToOwnerList) {
					if (ownersList.find((item: any) => item?.name === searchAclListOrUser)) {
						setIsShowError(true);
						setOwnerErrorMessage(
							t(
								// eslint-disable-next-line sonarjs/no-duplicate-string
								'label.acl_list_already_in_list_error',
								// eslint-disable-next-line sonarjs/no-duplicate-string
								'The Acl List / User is already in the list'
							)
						);
					} else {
						setOwnersList(
							ownersList.concat({ id: accountExists[0]?.id, name: accountExists[0]?.name })
						);
						setOpenAddAclListDialog(false);
					}
				} else if (dlm.find((item: any) => item === searchAclListOrUser)) {
					setIsShowError(true);
					setOwnerErrorMessage(
						t('label.acl_list_already_in_list_error', 'The Acl List / User is already in the list')
					);
				} else {
					setDlm(dlm.concat(accountExists[0]?.name));
					setOpenAddAclListDialog(false);
				}
			} else {
				setIsShowError(true);
				setOwnerErrorMessage(
					t(
						// eslint-disable-next-line sonarjs/no-duplicate-string
						'label.acl_list_not_exists_error_msg',
						// eslint-disable-next-line sonarjs/no-duplicate-string
						'The Acl List / User does not exist. Please check the spelling and try again.'
					)
				);
			}
		});
	}, [t, isAddToOwnerList, searchAclListOrUser, dlm, ownersList]);

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
	const [searchGrantEmailResult, setSearchGrantEmailResult] = useState<Array<any>>([]);
	const [grantEmailItem, setGrantEmailItem] = useState<string>('');
	const [grantEmailTableRows, setGrantEmailTableRows] = useState<Array<any>>([]);
	const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);

	const onGrantTypeChange = useCallback(
		(v: any): any => {
			const it = grantTypeOptions.find((item: any) => item.value === v);
			setGrantType(it);
		},
		[grantTypeOptions]
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const getGrantML = useCallback(() => {
		const getGrantBody: any = {};
		const target = {
			type: 'dl',
			by: 'name',
			_content: selectedAclList?.name
		};
		getGrantBody.target = target;
		getGrant(getGrantBody)
			.then((data: any) => {
				if (data && data?.grant && Array.isArray(data?.grant)) {
					const grant = data?.grant;
					if (grant.length > 1) {
						if (grant[1].grantee?.[0]?.type === 'all') {
							onGrantTypeChange(ALL);
						} else {
							onGrantTypeChange(EMAIL);
						}
						const emails: Array<any> = [];
						grant.forEach((grItem: any) => {
							emails.push({
								id: grItem?.grantee[0]?.id,
								name: grItem?.grantee[0]?.name
							});
						});
						setGrantEmails(emails);
						setGrantEmailsList(emails.map((item: any) => item?.name));
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
							grant[0]?.grantee[0]?.name !== selectedAclList?.name
						) {
							onGrantTypeChange(PUB);
							const it = grantTypeOptions.find((item: any) => item.value === EMAIL);
							const emails = [
								{
									id: grant[0]?.grantee[0]?.id,
									name: grant[0]?.grantee[0]?.name
								}
							];
							setGrantEmailsList(emails.map((item: any) => item?.name));
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
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, t, selectedAclList?.name, onGrantTypeChange, grantTypeOptions]);
	useEffect(() => {
		getGrantML();
	}, [getGrantML]);

	const onEmailAdd = useCallback((v) => {
		setGrantEmails(v);
		setIsDirty(true);
	}, []);

	const grantItems = searchGrantEmailResult.map((item: any, index) => ({
		id: item?.id,
		label: item?.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setGrantEmailItem(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	const searchEmailFromGal = useCallback((searchKeyword) => {
		searchGal(searchKeyword).then((data) => {
			const contactList = data?.cn;
			if (contactList) {
				let result: any[] = [];
				result = contactList.map((item: any): any => ({
					id: item?.id,
					name: item?._attrs?.email
				}));
				setSearchGrantEmailResult(result);
			} else {
				setSearchGrantEmailResult([]);
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
		description ? (latestData.description = description) : (latestData.description = '');
		zimbraDistributionListSendShareMessageToNewMembers
			? (latestData.zimbraDistributionListSendShareMessageToNewMembers = true)
			: (latestData.zimbraDistributionListSendShareMessageToNewMember = false);
		latestData.zimbraDistributionListUnsubscriptionPolicy =
			zimbraDistributionListUnsubscriptionPolicy;
		latestData.zimbraDistributionListSubscriptionPolicy = zimbraDistributionListSubscriptionPolicy;
		latestData.zimbraMailStatus = zimbraMailStatus;

		if (selectedAclList?.dynamic) {
			latestData.memberURL = memberURL;
			ownerOfList ? (latestData.ownerOffset = ownerOfList) : (latestData.ownerOffset = []);
		}

		latestData.grantType = grantType;
		latestData.grantEmails = grantEmails;
		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const onUndo = (): void => {
		previousDetail?.displayName ? setDisplayName(previousDetail?.displayName) : setDisplayName('');
		if (selectedAclList?.dynamic) {
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
		previousDetail?.description ? setDescription(previousDetail?.description) : setDescription('');
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
		if (selectedAclList?.dynamic) {
			previousDetail?.ownerOfList !== undefined
				? setOwnerOfList(previousDetail?.ownerOfList)
				: setOwnerOfList([]);
		}
		setIsDirty(false);
	};

	const callAllRequest = (requests: any): void => {
		setIsLoading(true);
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
				setIsLoading(false);
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
				setIsLoading(false);
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const onSave = (): void => {
		const attributes: any[] = [];
		const request: any[] = [];
		attributes.push({
			n: 'displayName',
			_content: displayName
		});

		attributes.push({
			n: 'zimbraNotes',
			_content: zimbraNotes
		});

		attributes.push({
			n: 'description',
			_content: description
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
		if (!selectedAclList?.dynamic) {
			attributes.push({
				n: 'zimbraDistributionListSendShareMessageToNewMembers',
				_content: zimbraDistributionListSendShareMessageToNewMembers ? 'TRUE' : 'FALSE'
			});
		}

		if (selectedAclList?.dynamic && !zimbraIsACLGroup) {
			attributes.push({
				n: 'memberURL',
				_content: memberURL
			});
		}

		request.push(modifyDistributionList(selectedAclList?.id, attributes));
		if (
			previousDetail?.distributionName !== undefined &&
			previousDetail?.distributionName !== distributionName
		) {
			request.push(
				renameDistributionList(
					selectedAclList?.id,
					`${distributionName.trim()}@${distributionDomain}`
				)
			);
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
						_content: selectedAclList?.id
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
						_content: selectedAclList?.id
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
						_content: selectedAclList?.id
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
						_content: selectedAclList?.id
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
			selectedAclList?.dynamic &&
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
						_content: selectedAclList?.id
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
						_content: selectedAclList?.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: distributionName
					};
					request.push(removeDistributionListMember(id, dlmItem));
				});
			}
		}
		/* Alias List */
		if (!isEqual(zimbraDefaultMailAlias, zimbraMailAlias)) {
			const deleteAliasArr = differenceBy(zimbraDefaultMailAlias, zimbraMailAlias, 'label');
			const addAliasArr = differenceBy(zimbraMailAlias, zimbraDefaultMailAlias, 'label');
			// eslint-disable-next-line array-callback-return
			deleteAliasArr.forEach((aliasName: any) => {
				callAllRequest(deleteAclListAliasRequest(selectedAclList?.id, `${aliasName?.label}`));
			});

			// eslint-disable-next-line array-callback-return
			addAliasArr.forEach((aliasName: any) => {
				callAllRequest(addAclListAliasRequest(selectedAclList?.id, `${aliasName?.label}`));
			});
		}

		let dl: any = {};
		let action: any = {};
		if (grantType?.value === PUB) {
			dl = { by: 'name', _content: selectedAclList?.name };
			action = {
				op: 'setRights',
				right: { right: 'sendToDistList', grantee: [] }
			};
		} else if (grantType?.value === GRP) {
			dl = { by: 'name', _content: selectedAclList?.name };
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: [{ type: 'grp', by: 'name', _content: selectedAclList?.name }]
				}
			};
		} else if (grantType?.value === ALL) {
			dl = { by: 'name', _content: selectedAclList?.name };
			action = {
				op: 'setRights',
				right: { right: 'sendToDistList', grantee: [{ type: 'all' }] }
			};
		} else if (grantType?.value === EMAIL) {
			dl = { by: 'name', _content: selectedAclList?.name };
			action = {
				op: 'setRights',
				right: {
					right: 'sendToDistList',
					grantee: grantEmails.map((item: any) => ({
						type: 'email',
						by: 'name',
						_content: item
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
		if (!isEqual(zimbraDefaultMailAlias, zimbraMailAlias)) {
			setIsDirty(true);
		}
	}, [zimbraDefaultMailAlias, zimbraMailAlias]);

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
		if (previousDetail?.description !== undefined && previousDetail?.description !== description) {
			setIsDirty(true);
		}
	}, [previousDetail?.description, description]);

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
		if (openAddAclListDialog) {
			setSearchAclListOrUser('');
			setIsShowError(false);
		}
	}, [openAddAclListDialog]);

	useEffect(() => {
		if (selectedAclList?.dynamic) {
			setIsAddToOwnerList(true);
		}
	}, [selectedAclList?.dynamic]);

	const searchMemberItems = searchMemberResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				style={{
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
				style={{
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
							'label.acl_list_not_exists_error_msg',
							'The Acl List / User does not exist. Please check the spelling and try again.'
						)
					);
				} else if (dlm.find((item: any) => item === searchMember)) {
					setIsShowMemberError(true);
					setMemberErrorMessage(
						t('label.acl_list_already_in_list_error', 'The Acl List / User is already in the list')
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
						'label.acl_list_not_exists_error_msg',
						'The Acl List / User does not exist. Please check the spelling and try again.'
					)
				);
				setIsShowMemberError(true);
			}
		}
	}, [searchMember, t, dlm]);

	const buttons = [
		{
			align: 'right',
			color: 'error',
			// eslint-disable-next-line sonarjs/no-duplicate-string
			label: t('label.delete', 'Delete'),
			disabled: !selectedAclList,
			onClick: (): void => {
				setIsOpenDeleteDialog(true);
			}
		},
		{
			align: 'left',
			icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
			onClick: (): void => {
				setIsSticky(!isSticky);
			}
		}
	];
	const closeHandler = useCallback(() => {
		setIsOpenDeleteDialog(false);
	}, []);
	const onSuccess = useCallback(
		(message) => {
			createSnackbar({
				key: 'success',
				type: 'success',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			getAclLists();
			setIsRequestInProgress(false);
			closeHandler();
			setShowEditAclList(false)(false);
			setIsUpdateRecord(true);
		},
		[closeHandler, createSnackbar, setIsUpdateRecord, setShowEditAclList, getAclLists]
	);
	const onDeleteHandler = useCallback(() => {
		setIsRequestInProgress(true);
		deleteDistributionList(dlId)
			.then(() => {
				onSuccess(
					t('label.dl_delete_successfull', '{{name}} has been deleted successfully', {
						name: distributionName
					})
				);
			})
			.then((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, onSuccess, t, dlId, distributionName]);

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
							'label.acl_list_not_exists_error_msg',
							'The Acl List / User does not exist. Please check the spelling and try again.'
						)
					);
				} else if (ownersList.find((item: any) => item?.name === searchOwner)) {
					setIsShowOwnerError(true);
					setOwnerErrorMessage(
						t('label.acl_list_already_in_list_error', 'The Acl List / User is already in the list')
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
						'label.acl_list_not_exists_error_msg',
						'The Acl List / User does not exist. Please check the spelling and try again.'
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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchGrantEmail = useCallback(
		debounce((searchWord) => {
			searchEmailFromGal(searchWord);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (grantEmailItem !== '') {
			searchGrantEmail(grantEmailItem);
		}
	}, [grantEmailItem, searchGrantEmail]);

	useMemo(() => {
		if (grantEmailsList && grantEmailsList.length > 0) {
			const allRows = grantEmailsList.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="light"
						key={item}
						color="gray0"
						onClick={(): void => {
							setSelectedGrantEmail([item]);
						}}
					>
						{item}
					</Text>
				]
			}));
			setGrantEmailTableRows(allRows);
		} else {
			setGrantEmailTableRows([]);
		}
	}, [grantEmailsList]);

	return (
		<>
			{isLoading && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					top: '0rem',
					overflow: 'hidden',
					transition: 'left 0.2s ease-in-out',
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
							{selectedAclList?.name} (
							{selectedAclList?.dynamic
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
										/>
									)}
								</Padding>
								{isDirty && (
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								)}
							</Container>
						)}
					</Row>
					<Row padding={{ right: 'extrasmall', left: 'small' }}>
						<IconButton
							size="medium"
							icon="CloseOutline"
							onClick={(): void => setShowEditAclList(false)}
						/>
					</Row>
				</Row>
				<Row>
					<Divider color="gray3" />
				</Row>

				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100% - 4.375rem)"
					background="white"
					style={{ overflow: 'auto' }}
					width="100%"
				>
					<Displayer buttons={buttons} pinIcon={isSticky} />
					<ListRow padding={{ left: 'large', right: 'large' }}>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.display_name', 'Display Name')}
								value={displayName}
								backgroundColor="gray5"
								onChange={(e: any): any => {
									setDisplayName(e.target.value);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow padding={{ left: 'large', right: 'large' }}>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.list_name', 'List Name')}
								backgroundColor="gray5"
								value={distributionName}
								inputName="prefixName"
								onChange={(e: any): any => {
									setDistributionName(e.target.value);
								}}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="center"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
							width="fit"
						>
							<Icon icon="AtOutline" size="large" />
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', left: 'small' }}
						>
							<Input
								label={t('domain.domain_name', 'Domain Name')}
								value={distributionDomain}
								readOnly
								backgroundColor="gray5"
							/>
						</Container>
					</ListRow>

					<ListRow padding={{ left: 'large', right: 'large' }}>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.share_message_to_new_member', 'Share message to new members')}
								backgroundColor="gray6"
								value={
									zimbraDistributionListSendShareMessageToNewMembers
										? t('label.yes', 'Yes')
										: t('label.no', 'No')
								}
								readOnly
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.hidden_from_gal', 'Hidden from GAL')}
								backgroundColor="gray6"
								value={zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')}
								readOnly
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.can_receive_email', 'Can receive email')}
								backgroundColor="gray6"
								value={
									zimbraMailStatus?.value === 'TRUE' ? t('label.yes', 'Yes') : t('label.no', 'No')
								}
								readOnly
							/>
						</Container>
					</ListRow>
					<ListRow padding={{ left: 'large', right: 'large' }}>
						<Container padding={{ top: 'small', bottom: 'medium' }}>
							<Input
								value={description}
								label={t('label.description', 'Description')}
								backgroundColor="gray5"
								onChange={(e: any): any => {
									setDescription(e.target.value);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow padding={{ left: 'large', right: 'large' }}>
						<Container padding={{ top: 'small', bottom: 'medium' }}>
							<Textarea
								value={zimbraNotes}
								label={t('label.notes', 'Notes')}
								background="gray5"
								onChange={(e: any): any => {
									setZimbraNotes(e.target.value);
								}}
							/>
						</Container>
					</ListRow>

					{!selectedAclList?.dynamic && (
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'large', right: 'large' }}
						>
							<Row padding={{ top: 'extralarge' }}>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.members', 'Members')}
								</Text>
							</Row>
							<Row
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
										<Row mainAlignment="flex-start" width="58%" crossAlignment="flex-start">
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
													backgroundColor="gray5"
													onChange={(e: any): any => {
														setSearchMember(e.target.value);
													}}
													hasError={isShowMemberError}
												/>
											</Dropdown>
										</Row>

										<Row width="42%" mainAlignment="flex-start" crossAlignment="flex-start">
											<Padding left="large" right="large">
												<Button
													type="outlined"
													key="add-button"
													label={t('label.add', 'Add')}
													color="primary"
													icon="PlusOutline"
													iconPlacement="right"
													onClick={onAdd}
													size="extralarge"
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
												size="extralarge"
												disabled={selectedDistributionListMember.length === 0}
												onClick={onDeleteFromList}
											/>
										</Row>
									</Row>
								</Container>
							</Row>
							{isShowMemberError && (
								<Row>
									<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
										<Padding all="small">
											<Text size="extrasmall" weight="regular" color="error">
												{memberErrorMessage}
											</Text>
										</Padding>
									</Container>
								</Row>
							)}
						</Container>
					)}
					<Container
						mainAlignment="flex-start"
						padding={{ top: 'small', bottom: 'small', left: 'large', right: 'large' }}
					>
						<Table
							rows={dlmTableRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>

					{dlmTableRows.length === 0 && !selectedAclList?.dynamic && (
						<ListRow>
							<Container
								background="gray6"
								height="fit-content"
								mainAlignment="center"
								crossAlignment="center"
							>
								<Padding value="57px 0 0 0" width="100%">
									<Row mainAlignment="center" width="100%">
										<img src={helmetLogo} alt="logo" />
									</Row>
								</Padding>
								<Padding vertical="extralarge" width="100%">
									<Row mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t('label.there_are_not_member_here', 'There aren’t members here.')}
										</Text>
									</Row>
									<Row mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t(
												'label.search_for_user_and_clic_to_add',
												'Search for a user and click on the ADD button.'
											)}
										</Text>
									</Row>
								</Padding>
							</Container>
						</ListRow>
					)}
					<ListRow>
						{!selectedAclList?.dynamic && (
							<Container
								padding={{ all: 'small' }}
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Paging totalItem={1} pageSize={10} setOffset={setMemberOffset} />
							</Container>
						)}
					</ListRow>

					<Row padding={{ top: 'small', bottom: 'medium', left: 'large', right: 'large' }}>
						<Text size="medium" weight="bold" color="gray0">
							{t('label.owners_settings_lbl', 'Owners’ Settings')}
						</Text>
					</Row>
					<Row padding={{ left: 'large', right: 'large' }}>
						<Text
							size="medium"
							color="secondary"
							style={{ whiteSpace: 'normal' }}
							overflow="break-word"
						>
							{t(
								'label.owners_description_msg_1',
								'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
							)}
						</Text>
					</Row>

					<Row
						mainAlignment="flex-start"
						width="100%"
						padding={{
							top: 'small',
							bottom: isShowOwnerError ? 'extrasmall' : 'small',
							left: 'large',
							right: 'large'
						}}
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
								<Row mainAlignment="flex-start" width="58%" crossAlignment="flex-start">
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
											value={searchOwner}
											onChange={(e: any): void => {
												setSearchOwner(e.target.value);
											}}
											hasError={isShowOwnerError}
										/>
									</Dropdown>
								</Row>
								<Row width="42%" mainAlignment="flex-start" crossAlignment="flex-start">
									<Padding left="large" right="large">
										<Button
											type="outlined"
											key="add-button"
											label={t('label.add', 'Add')}
											color="primary"
											icon="PlusOutline"
											iconPlacement="right"
											onClick={onAddOwner}
											size="extralarge"
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
										size="extralarge"
										disabled={selectedOwnerListMember.length === 0}
										onClick={onDeleteFromOwnerList}
									/>
								</Row>
							</Row>
						</Container>
						{isShowOwnerError && (
							<Row>
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding all={'0'}>
										<Text size="extrasmall" weight="regular" color="error">
											{ownerErrorMessage}
										</Text>
									</Padding>
								</Container>
							</Row>
						)}
					</Row>

					<Container
						padding={{
							top: 'small',
							bottom: 'small',
							left: 'large',
							right: 'large'
						}}
						mainAlignment="flex-start"
					>
						<Table
							rows={ownerTableRows}
							headers={ownerHeaders}
							showCheckbox={false}
							selectedRows={selectedOwnerListMember}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>

					{ownerTableRows.length === 0 && (
						<ListRow>
							<Container
								background="gray6"
								height="fit-content"
								mainAlignment="center"
								crossAlignment="center"
							>
								<Padding value="57px 0 0 0" width="100%">
									<Row mainAlignment="center" width="100%">
										<img src={helmetLogo} alt="logo" />
									</Row>
								</Padding>
								<Padding vertical="extralarge" width="100%">
									<Row mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t('label.there_are_no_owners', 'There aren’t owners here.')}
										</Text>
									</Row>
									<Row mainAlignment="center" width="100%">
										<Text size="large" color="secondary" weight="regular">
											{t(
												'label.search_for_user_and_clic_to_add',
												'Search for a user and click on the ADD button.'
											)}
										</Text>
									</Row>
								</Padding>
							</Container>
						</ListRow>
					)}

					<ListRow>
						<Container
							padding={{ all: 'small' }}
							mainAlignment={selectedAclList?.dynamic ? 'flex-start' : 'flex-end'}
							crossAlignment={selectedAclList?.dynamic ? 'flex-start' : 'flex-end'}
						>
							<Paging totalItem={1} pageSize={10} setOffset={setOwnerOffset} />
						</Container>
					</ListRow>
				</Container>
				<Modal
					title={
						<Trans
							i18nKey="label.would_you_like_to_add_ml"
							defaults="<bold>Who would you like to add to the Acl List?</bold>"
							components={{ bold: <strong /> }}
						/>
					}
					open={openAddAclListDialog}
					showCloseIcon
					onClose={(): void => {
						setOpenAddAclListDialog(false);
					}}
					size="medium"
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button
								label={t('label.help', 'Help')}
								type="outlined"
								color="primary"
								onClick={(): null => null}
							/>
							<Container orientation="horizontal" mainAlignment="flex-end">
								<Padding all="small">
									<Button
										label={t('label.go_back', 'Go Back')}
										color="secondary"
										size="medium"
										onClick={(): void => {
											setOpenAddAclListDialog(false);
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
								'label.add_in_acl_list_or_both',
								'You add another Acl List or a User. Both of them can be a Owner of the list.'
							)}
						</Text>

						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="fill"
							padding={{ top: 'medium' }}
						>
							<Input
								value={searchAclListOrUser}
								backgroundColor="gray5"
								onChange={(e: any): void => {
									setSearchAclListOrUser(e.target.value);
								}}
								hasError={isShowError}
								label={t('label.acl_list_user', 'Acl List / User')}
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
								disabled={selectedAclList?.dynamic}
								iconColor="primary"
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
				{isOpenDeleteDialog && (
					<Modal
						size="medium"
						title={t('label.you_are_deleting_ml', 'You are deleting {{name}}', {
							name: displayName || distributionName
						})}
						open={isOpenDeleteDialog}
						customFooter={
							<Container orientation="horizontal" mainAlignment="flex-end">
								<Row style={{ gap: '0.5rem' }}>
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										type="outlined"
										onClick={(): void => closeHandler()}
										disabled={isRequestInProgress}
									/>
									<Button
										label={t('label.yes_delete_it', 'Yes, Delete it')}
										color="error"
										onClick={(): void => onDeleteHandler()}
										disabled={isRequestInProgress}
									/>
								</Row>
							</Container>
						}
						showCloseIcon
						onClose={closeHandler}
					>
						<Container
							padding={{ top: 'extralarge', bottom: 'extralarge' }}
							style={{ textAlign: 'center' }}
						>
							<Padding bottom="small">
								<Text size={'extralarge'} overflow="break-word">
									<Trans
										i18nKey="label.are_you_sure_delete_distribution_list"
										defaults="Are you sure you want to delete <bold>{{name}}</bold> ?"
										components={{ bold: <strong /> }}
										values={{
											name: displayName || distributionName
										}}
									/>
								</Text>
							</Padding>
						</Container>
					</Modal>
				)}
			</Container>
		</>
	);
};
export default EditAclListView;
