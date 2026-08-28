/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	Padding,
	RouteLeavingGuard,
	Row,
	TabBar,
	useSnackbar
} from '@zextras/ui-components';
import { useUserSettings } from '@zextras/ui-shared';
import { format, isValid } from 'date-fns';
import { isEqual } from 'lodash';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL, DL, EMAIL, GRP, PUB, TRUE_FALSE } from '../../../../constants';
import { getGrant } from '../../../../services/get-grant';
import { useAddDistributionListMember } from '../../../../services/use-add-distribution-list-member';
import { useAddMailingListAlias } from '../../../../services/use-add-mailing-list-alias';
import { useDeleteDistributionList } from '../../../../services/use-delete-distribution-list';
import { useDeleteMailingListAlias } from '../../../../services/use-delete-mailing-list-alias';
import { useDistributionList } from '../../../../services/use-distribution-list';
import { useDistributionListAction } from '../../../../services/use-distribution-list-action';
import { useDistributionListGrants } from '../../../../services/use-distribution-list-grants';
import { useDistributionListMembership } from '../../../../services/use-distribution-list-membership';
import { useModifyDistributionList } from '../../../../services/use-modify-distribution-list';
import { useRemoveDistributionListMember } from '../../../../services/use-remove-distribution-list-member';
import { useRenameDistributionList } from '../../../../services/use-rename-distribution-list';
import { getDateTimeFromStr } from '../../../utility/utils';
import { GeneralTab } from '../edit-mailing-detail/general-tab';
import { ReusedDefaultTabBar } from '../edit-mailing-detail/reused-default-tab-bar';
import { buildSaveOperations, type SaveOperation } from './build-save-operations';
import { DeleteDistributionListModal } from './delete-distribution-list-modal';
import { MembersTab } from './members-tab/members-tab';
import { OwnersTab } from './owners-tab/owners-tab';
import {
	parseDistributionListDetail,
	parseDistributionListGrants,
	parseDistributionListMembership
} from './parse-distribution-list-detail';
import { SendAsTab } from './send-as-tab/send-as-tab';
import { SendToTab } from './send-to-tab/send-to-tab';
import { TabDirtyGuardModal } from './tab-dirty-guard-modal';

const EditDistributionList: FC<any> = ({
	selectedMailingList,
	setIsUpdateRecord,
	setShowMailingListDetailView
}) => {
	const [t] = useTranslation();
	const searchUserLabelValue = t(
		'label.search_for_user_and_clic_to_add',
		'Search for a user and click on the ADD button.'
	);
	const createSnackbar = useSnackbar();
	const [displayName, setDisplayName] = useState<string>('');
	const [distributionName, setDistributionName] = useState<string>('');
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
	const [ownersList, setOwnersList] = useState<any[]>([]);
	const [dlMembershipListNames, setDlMembershipListNames] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [memberURL, setMemberURL] = useState<string>();
	const [ownerOfList, setOwnerOfList] = useState<any[]>([]);
	const [zimbraIsACLGroup, setZimbraIsACLGroup] = useState<boolean>(false);
	const [isShowSenderToError, setIsShowSenderToError] = useState<boolean>(false);
	const [granteeTotalRights, setGranteeTotalRights] = useState(0);
	const [targetTotalRights, setTargetTotalRights] = useState(0);
	const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
	const [totalGrantRights, setTotalGrantRights] = useState(0);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);
	const userSetting = useUserSettings();
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState<string>('general');
	const [isOpenUnsavedDialog, setIsOpenUnsavedDialog] = useState<boolean>(false);
	const [pendingTab, setPendingTab] = useState<string | null>(null);

	// sendEmails
	const [sendEmails, setSendEmails] = useState<any>([]);

	const [sendEmailsList, setSendEmailsList] = useState<any>([]);

	const dlCreateDate = useMemo(() => {
		if (!zimbraCreateTimestamp || zimbraCreateTimestamp === '') {
			return '';
		}
		const date = getDateTimeFromStr(zimbraCreateTimestamp);
		return date && isValid(date) ? format(date, 'dd MMM yyyy - HH:mm') : '';
	}, [zimbraCreateTimestamp]);

	const rightsOptions: any[] = useMemo(
		() => [
			{
				label: t('domain.mailingList.canReceive', 'Can Receive'),
				value: TRUE_FALSE.TRUE
			},
			{
				label: t('domain.mailingList.cantReceive', "Can't Receive"),
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

	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === 'TRUE') {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const [previousDetail, setPreviousDetail] = useState<any>({});

	const [zimbraMailStatus, setZimbraMailStatus] = useState<any>(rightsOptions[1]);

	const onRightsChange = useCallback(
		(v: any): any => {
			const it = rightsOptions.find((item: any) => item.value === v);
			setZimbraMailStatus(it);
		},
		[rightsOptions]
	);

	/* Cached data layer */
	const detailQuery = useDistributionList(selectedMailingList?.id, selectedMailingList?.name);
	const membershipQuery = useDistributionListMembership(
		selectedMailingList?.dynamic || !selectedMailingList?.id ? undefined : selectedMailingList?.id
	);
	const grantsQuery = useDistributionListGrants(
		isDirty || !selectedMailingList?.id ? undefined : selectedMailingList?.id
	);

	const modifyMutation = useModifyDistributionList(selectedMailingList?.id ?? '');
	const renameMutation = useRenameDistributionList(selectedMailingList?.id ?? '');
	const addAliasMutation = useAddMailingListAlias(selectedMailingList?.id ?? '');
	const removeAliasMutation = useDeleteMailingListAlias(selectedMailingList?.id ?? '');
	const actionMutation = useDistributionListAction(selectedMailingList?.id ?? '');
	const addMemberMutation = useAddDistributionListMember();
	const removeMemberMutation = useRemoveDistributionListMember();
	const deleteListMutation = useDeleteDistributionList(selectedMailingList?.id ?? '');

	/* Mirror the selected list (display name / address) into the edit state */
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
	}, [selectedMailingList]);

	/* Mirror the cached distribution list detail into the edit state */
	useEffect(() => {
		const parsed = parseDistributionListDetail(detailQuery.data, selectedMailingList?.name);
		if (!parsed) {
			return;
		}
		setdlId(parsed.dlId);
		setDlm(parsed.dlm);
		setZimbraHideInGal(parsed.zimbraHideInGal);
		setZimbraNotes(parsed.zimbraNotes);
		setDescription(parsed.description);
		setZimbraDistributionListSendShareMessageToNewMembers(parsed.sendShareMessageToNewMembers);
		setZimbraMailAlias(parsed.aliases);
		setDefaultZimbraMailAlias(parsed.aliases);
		setZimbraCreateTimestamp(parsed.createTimestamp);
		setZimbraMailStatus(rightsOptions[parsed.mailStatusEnabled ? 0 : 1]);
		setZimbraIsACLGroup(parsed.isACLGroup);
		if (parsed.memberURL) {
			setMemberURL(parsed.memberURL);
		}
		setPreviousDetail((prevState: any) => ({
			...prevState,
			dlm: parsed.dlm,
			zimbraHideInGal: parsed.zimbraHideInGal,
			zimbraNotes: parsed.zimbraNotes,
			description: parsed.description,
			zimbraDistributionListSendShareMessageToNewMembers: parsed.sendShareMessageToNewMembers,
			zimbraMailStatus: rightsOptions[parsed.mailStatusEnabled ? 0 : 1],
			memberURL: parsed.memberURL
				? parsed.memberURL
				: selectedMailingList?.dynamic
					? ''
					: prevState.memberURL
		}));
	}, [detailQuery.data, selectedMailingList?.name, selectedMailingList?.dynamic, rightsOptions]);

	/* Mirror the cached membership (lists this list is a member of) */
	useEffect(() => {
		const data = membershipQuery.data;
		if (!data) {
			return;
		}
		const members = parseDistributionListMembership(data);
		if (members.length > 0) {
			const allMembers = members.map((item) => ({
				label: item.name,
				background: 'gray3',
				color: 'text',
				id: item.id,
				name: item.name
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
	}, [membershipQuery.data]);

	const [grantType, setGrantType] = useState<any>([]);
	const [grantEmails, setGrantEmails] = useState<any>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);

	const onGrantTypeChange = useCallback(
		(v: any): any => {
			const it = grantTypeOptions.find((item: any) => item.value === v);
			setGrantType(it);
			if (
				previousDetail?.grantType !== undefined &&
				previousDetail?.grantType?.value !== undefined &&
				previousDetail?.grantType?.value !== v
			) {
				setIsDirty(true);
			}
		},
		[grantTypeOptions, grantType, previousDetail?.grantType, setIsDirty]
	);

	useEffect(() => {
		if (grantType && grantType?.value === ALL) {
			setTimeout(() => {
				setGrantEmailsList([]);
			}, 100);
		}
	}, [grantType]);

	/* Mirror the cached grants (owners / send-as / send-to rights) */
	useEffect(() => {
		const data = grantsQuery.data;
		if (!data) {
			return;
		}
		const parsed = parseDistributionListGrants(data, selectedMailingList?.id);

		// same dirty implications as the original imperative flow
		if (
			previousDetail?.grantType !== undefined &&
			previousDetail?.grantType?.value !== undefined &&
			previousDetail?.grantType?.value !== parsed.grantType
		) {
			setIsDirty(true);
		}
		setGrantType(grantTypeOptions.find((item: any) => item.value === parsed.grantType));

		if (parsed.sendAs.length > 0) {
			setSendEmails(parsed.sendAs);
			setSendEmailsList(parsed.sendAs);
		}
		if (parsed.grantEmails.length > 0) {
			setGrantEmails(parsed.grantEmails);
			setGrantEmailsList(parsed.grantEmails.map((item: any) => item?.name));
		}
		if (parsed.owners.length > 0) {
			setOwnersList(parsed.owners);
		}
		setPreviousDetail((prevState: any) => ({
			...prevState,
			grantEmails: parsed.grantEmails,
			ownersList: parsed.owners,
			sendEmailsList: parsed.sendAs,
			grantType: grantTypeOptions.find((item: any) => item.value === parsed.grantType)
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [grantsQuery.data, selectedMailingList?.id]);

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
		latestData.zimbraMailStatus = zimbraMailStatus;

		if (selectedMailingList?.dynamic) {
			latestData.memberURL = memberURL;
			ownerOfList ? (latestData.ownerOffset = ownerOfList) : (latestData.ownerOffset = []);
		}

		latestData.grantType = grantType;
		latestData.grantEmails = grantEmails;
		latestData.sendEmails = sendEmails;
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
		previousDetail?.sendEmailsList !== undefined
			? setSendEmails(previousDetail?.sendEmailsList)
			: setSendEmails([]);
		previousDetail?.zimbraNotes ? setZimbraNotes(previousDetail?.zimbraNotes) : setZimbraNotes('');
		previousDetail?.description
			? setDescription(previousDetail?.description)
			: setDescription('');
		previousDetail?.zimbraDistributionListSendShareMessageToNewMembers
			? setZimbraDistributionListSendShareMessageToNewMembers(true)
			: setZimbraDistributionListSendShareMessageToNewMembers(false);
		previousDetail?.zimbraMailStatus !== undefined
			? setZimbraMailStatus(previousDetail?.zimbraMailStatus)
			: setZimbraMailStatus(rightsOptions[1]);
		if (selectedMailingList?.dynamic) {
			previousDetail?.ownerOfList !== undefined
				? setOwnerOfList(previousDetail?.ownerOfList)
				: setOwnerOfList([]);
		}
		setZimbraMailAlias(zimbraDefaultMailAlias);
		setIsDirty(false);
	};

	function executeSaveOperation(operation: SaveOperation): Promise<any> {
		switch (operation.type) {
			case 'modify':
				return modifyMutation.mutateAsync(operation.attributes);
			case 'rename':
				return renameMutation.mutateAsync(operation.newName);
			case 'addAlias':
				return addAliasMutation.mutateAsync(operation.alias);
			case 'removeAlias':
				return removeAliasMutation.mutateAsync(operation.alias);
			case 'addMemberOf':
				return addMemberMutation.mutateAsync({
					listId: operation.listId,
					member: operation.member
				});
			case 'removeMemberOf':
				return removeMemberMutation.mutateAsync({
					listId: operation.listId,
					member: operation.member
				});
			case 'action':
				return actionMutation.mutateAsync({ dl: operation.dl, action: operation.action });
		}
	}

	const callAllRequests = (operations: Array<SaveOperation>): void => {
		setIsLoading(true);
		Promise.all(operations.map(executeSaveOperation))
			.then((data: any) => {
				let isError = false;
				let errorMessage = '';
				if (grantType?.value !== EMAIL) {
					setGrantEmailsList([]);
					setGrantEmails([]);
				}
				data.forEach((item: any) => {
					if (item?.Fault) {
						isError = true;
						errorMessage = item?.Fault?.Reason?.Text;
					}
				});
				if (isError) {
					createSnackbar({
						key: 'error',
						severity: 'error',
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
						severity: 'success',
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
					severity: 'error',
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

	const onSave = (): void => {
		const operations = buildSaveOperations(previousDetail, {
			displayName,
			distributionName,
			zimbraNotes,
			description,
			zimbraMailStatusValue: zimbraMailStatus?.value,
			zimbraHideInGal,
			sendShareMessageToNewMembers: zimbraDistributionListSendShareMessageToNewMembers,
			memberURL,
			dynamic: Boolean(selectedMailingList?.dynamic),
			isACLGroup: zimbraIsACLGroup,
			listId: selectedMailingList?.id ?? '',
			listName: selectedMailingList?.name ?? '',
			defaultAliases: zimbraDefaultMailAlias ?? [],
			aliases: zimbraMailAlias ?? [],
			dlMembershipList,
			ownerOfList,
			grantEmails: grantEmails ?? [],
			grantTypeValue: grantType?.value
		});

		if (!isEqual(zimbraDefaultMailAlias, zimbraMailAlias)) {
			setDefaultZimbraMailAlias(zimbraMailAlias);
		}

		if (operations.length > 0) {
			callAllRequests(operations);
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
		if (
			previousDetail?.ownerOfList !== undefined &&
			!isEqual(previousDetail?.ownerOfList, ownerOfList)
		) {
			setIsDirty(true);
		}
	}, [previousDetail?.ownerOfList, ownerOfList]);

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

	const handleClickDeleteEvent = useCallback(() => {
		const getGrantBody: any = {};
		const grantee = {
			type: GRP,
			by: 'id',
			_content: selectedMailingList?.id,
			all: false
		};
		getGrantBody.grantee = grantee;
		getGrant(getGrantBody)
			.then((data: any) => {
				if (data && data?.grant && Array.isArray(data?.grant)) {
					let granteeTotal = 0;

					const granteeRights = data?.grant?.map((items: any) => items?.right?.length);
					const granteeRightLenght = granteeRights?.values();

					for (const value of granteeRightLenght) {
						granteeTotal += value;
					}
					setGranteeTotalRights(granteeTotal);
				}
				setIsOpenDeleteDialog(true);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});

		// get grants' rights as target
		const getGrantBodyTarget: any = {};
		const target = {
			type: DL,
			by: 'id',
			_content: selectedMailingList?.id
		};
		getGrantBodyTarget.target = target;
		getGrant(getGrantBodyTarget)
			.then((resFromTarget: any) => {
				if (resFromTarget && resFromTarget?.grant && Array.isArray(resFromTarget?.grant)) {
					let targetTotal = 0;
					const targetRights = resFromTarget?.grant?.map((items: any) => items?.right?.length);
					const targetRightLenght = targetRights?.values();

					for (const value of targetRightLenght) {
						targetTotal += value;
					}
					setTargetTotalRights(targetTotal);
				}
				setIsOpenDeleteDialog(true);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, selectedMailingList?.name, t]);

	const closeHandler = useCallback(() => {
		setIsOpenDeleteDialog(false);
	}, []);

	const onSuccess = useCallback(
		(message: string) => {
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setIsRequestInProgress(false);
			closeHandler();
			setShowMailingListDetailView(false);
			setIsUpdateRecord(true);
		},
		[closeHandler, createSnackbar, setIsUpdateRecord, setShowMailingListDetailView]
	);

	const onDeleteHandler = useCallback(() => {
		setIsRequestInProgress(true);
		deleteListMutation.mutate(undefined, {
			onSuccess: () =>
				onSuccess(
					t('label.dl_delete_successfull', '{{name}} has been deleted successfully', {
						name: distributionName
					})
				),
			onError: (error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	}, [createSnackbar, onSuccess, t, distributionName, deleteListMutation]);

	useEffect(() => {
		const totalRights = targetTotalRights + granteeTotalRights;
		setTotalGrantRights(totalRights);
	}, [granteeTotalRights, targetTotalRights]);

	const items: any = [
		{
			id: 'general',
			label: t('label.general', 'GENERAL'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'members',
			label: t('label.members', 'MEMBERS').toLocaleUpperCase(),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'owners',
			label: t('label.owners', 'OWNERS'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'sendas',
			label: t('domain.distributionList.sendAs', 'SEND AS').toLocaleUpperCase(),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'sendto',
			label: t('domain.distributionList.sendTo', 'SEND TO').toLocaleUpperCase(),
			CustomComponent: ReusedDefaultTabBar
		}
	];

	return (
		<>
			{isLoading && <ds-spinner></ds-spinner>}
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					top: '0rem',
					height: 'auto',
					width: 'auto',
					overflow: 'hidden',
					transition: 'left 0.2s ease-in-out',
					boxShadow: '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)',
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
						<ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
							{distributionName} (
							{selectedMailingList?.dynamic
								? t('label.dynamic', 'Dynamic')
								: t('label.standard', 'Standard')}
							)
						</ds-text>
					</Row>
					<Row>
						{!isDirty && (
							<Row padding={{ right: 'medium' }}>
								<Button
									size="medium"
									type="outlined"
									color="error"
									onClick={handleClickDeleteEvent}
									icon="Trash2Outline"
									label={t('label.delete', 'delete')}
								/>
							</Row>
						)}
						{isDirty && (
							<Container
								orientation="horizontal"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
								background="gray6"
							>
								<Padding right="small">
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onUndo}
									/>
								</Padding>
								<Padding right="small">
									<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
								</Padding>
							</Container>
						)}
					</Row>
					<Row padding={{ right: 'extrasmall', left: 'small' }}>
						<Button
							type="ghost"
							color={'text'}
							size="medium"
							icon="CloseOutline"
							onClick={(): void => setShowMailingListDetailView(false)}
						/>
					</Row>
				</Row>
				<Row>
					<ds-divider color="gray3" />
				</Row>

				<Container
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					background="white"
				>
					<TabBar
						items={items}
						selected={selectedTab}
						onChange={(ev: unknown, selectedId: string): void => {
							if (
								isDirty &&
								(selectedTab === 'general' || selectedTab === 'sendto') &&
								selectedId !== selectedTab
							) {
								setPendingTab(selectedId);
								setIsOpenUnsavedDialog(true);
							} else {
								setSelectedTab(selectedId);
							}
						}}
						width="100%"
						background="gray6"
					/>
					<ds-divider color="gray2" />
				</Container>

				{selectedTab === 'general' && (
					<GeneralTab
						displayName={displayName}
						setDisplayName={setDisplayName}
						distributionName={distributionName}
						setDistributionName={setDistributionName}
						zimbraHideInGal={zimbraHideInGal}
						setZimbraHideInGal={setZimbraHideInGal}
						zimbraNotes={zimbraNotes}
						setZimbraNotes={setZimbraNotes}
						description={description}
						setDescription={setDescription}
						zimbraDistributionListSendShareMessageToNewMembers={
							zimbraDistributionListSendShareMessageToNewMembers
						}
						setZimbraDistributionListSendShareMessageToNewMembers={
							setZimbraDistributionListSendShareMessageToNewMembers
						}
						zimbraMailStatus={zimbraMailStatus}
						onRightsChange={onRightsChange}
						rightsOptions={rightsOptions}
						zimbraMailAlias={zimbraMailAlias}
						setZimbraMailAlias={setZimbraMailAlias}
						dlCreateDate={dlCreateDate}
						dlId={dlId}
						dlmCount={dlm.length}
						selectedMailingList={selectedMailingList}
						dlMembershipListNames={dlMembershipListNames}
						setIsDirty={setIsDirty}
					/>
				)}

				{selectedTab === 'members' && (
					<MembersTab
						dlm={dlm}
						setDlm={setDlm}
						setPreviousDetail={setPreviousDetail}
						selectedMailingList={selectedMailingList}
						isRequestInProgress={isRequestInProgress}
						setIsRequestInProgress={setIsRequestInProgress}
						searchUserLabelValue={searchUserLabelValue}
						isGlobalAdmin={isGlobalAdmin}
						memberURL={memberURL}
						setMemberURL={setMemberURL}
					/>
				)}

				{selectedTab === 'owners' && (
					<OwnersTab
						ownersList={ownersList}
						setOwnersList={setOwnersList}
						setPreviousDetail={setPreviousDetail}
						selectedMailingList={selectedMailingList}
						isRequestInProgress={isRequestInProgress}
						setIsRequestInProgress={setIsRequestInProgress}
						searchUserLabelValue={searchUserLabelValue}
					/>
				)}

				{selectedTab === 'sendas' && (
					<SendAsTab
						sendEmailsList={sendEmailsList}
						setSendEmailsList={setSendEmailsList}
						setSendEmails={setSendEmails}
						setPreviousDetail={setPreviousDetail}
						selectedMailingList={selectedMailingList}
						isRequestInProgress={isRequestInProgress}
						setIsRequestInProgress={setIsRequestInProgress}
						searchUserLabelValue={searchUserLabelValue}
					/>
				)}

				{selectedTab === 'sendto' && (
					<SendToTab
						grantTypeOptions={grantTypeOptions}
						grantType={grantType}
						onGrantTypeChange={onGrantTypeChange}
						grantEmailsList={grantEmailsList}
						setGrantEmailsList={setGrantEmailsList}
						setGrantEmails={setGrantEmails}
						setIsDirty={setIsDirty}
						searchUserLabelValue={searchUserLabelValue}
						isShowSenderToError={isShowSenderToError}
						setIsShowSenderToError={setIsShowSenderToError}
					/>
				)}

				{isOpenUnsavedDialog && (
					<TabDirtyGuardModal
						open={isOpenUnsavedDialog}
						onExitWithoutSave={(): void => {
							onUndo();
							if (pendingTab) {
								setSelectedTab(pendingTab);
							}
							setPendingTab(null);
							setIsOpenUnsavedDialog(false);
						}}
						onSaveAndExit={(): void => {
							onSave();
							if (pendingTab) {
								setSelectedTab(pendingTab);
							}
							setPendingTab(null);
							setIsOpenUnsavedDialog(false);
						}}
						onClose={(): void => {
							setPendingTab(null);
							setIsOpenUnsavedDialog(false);
						}}
					/>
				)}

				<RouteLeavingGuard when={isDirty} onSave={onSave} />
				{isOpenDeleteDialog && (
					<DeleteDistributionListModal
						open={isOpenDeleteDialog}
						listLabel={displayName || distributionName}
						totalGrantRights={totalGrantRights}
						isRequestInProgress={isRequestInProgress}
						onCancel={closeHandler}
						onConfirm={onDeleteHandler}
					/>
				)}
			</Container>
		</>
	);
};

export default EditDistributionList;
