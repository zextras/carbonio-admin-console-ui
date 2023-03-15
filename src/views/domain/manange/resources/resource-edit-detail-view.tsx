/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import {
	Container,
	Input,
	Row,
	Text,
	IconButton,
	Icon,
	Divider,
	Select,
	Button,
	Padding,
	PasswordInput,
	SnackbarManagerContext,
	Modal
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import ListRow from '../../../list/list-row';
import { getCalenderResource } from '../../../../services/get-cal-resource-service';
import { getSingatures } from '../../../../services/get-signature-service';
import { useDomainStore } from '../../../../store/domain/store';
import { setPasswordRequest } from '../../../../services/set-password-service';
import { renameCalendarResource } from '../../../../services/rename-cal-resource-service';
import { modifyCalendarResource } from '../../../../services/modify-cal-resource-service';
import Textarea from '../../../components/textarea';
import { SendInviteAccounts } from './send-invite-accounts';
import { SignatureDetail } from './signature-detail';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';
import { deleteCalendarResource } from '../../../../services/delete-cal-resource-service';

// eslint-disable-next-line no-shadow
export enum RESOURCE_TYPE {
	LOCATION = 'Location',
	EQUIPMENT = 'Equipment'
}

// eslint-disable-next-line no-shadow
export enum TRUE_FALSE {
	TRUE = 'TRUE',
	FALSE = 'FALSE'
}

// eslint-disable-next-line no-shadow
export enum STATUS {
	ACTIVE = 'active',
	CLOSED = 'closed'
}

// eslint-disable-next-line no-shadow
export enum SCHEDULE_POLITY_TYPE {
	AUTO_ACCEPT = 1,
	MANUAL_ACCEPT = 2,
	AUTO_ACCEPT_ALWAYS = 3,
	NO_AUTO_ACCEPT = 4
}

const ResourceEditDetailView: FC<any> = ({
	selectedResourceList,
	setShowResourceEditDetailView,
	isEditMode,
	setIsEditMode,
	setIsUpdateRecord
}) => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosList = useDomainStore((state) => state.cosList);
	const [resourceInformation, setResourceInformation]: any = useState([]);
	const [resourceDetailData, setResourceDetailData]: any = useState({});
	const [sendInviteList, setSendInviteList] = useState<any[]>([]);
	const [sendInviteData, setSendInviteData]: any = useState([]);
	const [signatureData, setSignatureData]: any = useState([]);
	const [zimbraCOSId, setZimbraCOSId] = useState<any>('');
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	const [resourceName, setResourceName] = useState<string>('');
	const [resourceMail, setResourceMail] = useState<string>('');
	const [zimbraCalResMaxNumConflictsAllowed, setZimbraCalResMaxNumConflictsAllowed] =
		useState<string>('');
	const [zimbraCalResMaxPercentConflictsAllowed, setZimbraCalResMaxPercentConflictsAllowed] =
		useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const STATUS_COLOR: any = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			closed: {
				color: '#828282',
				label: t('label.closed', 'Closed')
			}
		}),
		[t]
	);

	const resourceTypeOptions: any[] = useMemo(
		() => [
			{
				label: t('label.location', 'Location'),
				value: RESOURCE_TYPE.LOCATION
			},
			{
				label: t('label.device', 'Device'),
				value: RESOURCE_TYPE.EQUIPMENT
			}
		],
		[t]
	);

	const accountStatusOptions: any[] = useMemo(
		() => [
			{
				label: t('label.active', 'Active'),
				value: STATUS.ACTIVE
			},
			{
				label: t('label.closed', 'Closed'),
				value: STATUS.CLOSED
			}
		],
		[t]
	);

	const autoRefuseOption: any[] = useMemo(
		() => [
			{
				label: t('label.yes', 'Yes'),
				value: TRUE_FALSE.TRUE
			},
			{
				label: t('label.no', 'No'),
				value: TRUE_FALSE.FALSE
			}
		],
		[t]
	);

	const schedulePolicyItems: any[] = useMemo(
		() => [
			{
				label: t(
					'label.auto_accept_auto_decline_on_conflict',
					'Automatic acceptance if available, automatic rejection in case of conflict'
				),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT
			},
			{
				label: t(
					'label.manual_accept_auto_decline_on_conflict',
					'Handle acceptance, automatic rejection in case of conflict'
				),
				value: SCHEDULE_POLITY_TYPE.MANUAL_ACCEPT
			},
			{
				label: t('label.auto_accept_always', 'Automatic acceptance if available always'),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT_ALWAYS
			},
			{
				label: t('label.no_auto_accept_or_decline', 'No automatic acceptance if available always'),
				value: SCHEDULE_POLITY_TYPE.NO_AUTO_ACCEPT
			}
		],
		[t]
	);

	const [zimbraCalResType, setZimbraCalResType]: any = useState(resourceTypeOptions[0]);
	const [zimbraAccountStatus, setZimbraAccountStatus]: any = useState(accountStatusOptions[0]);
	const [zimbraCalResAutoDeclineRecurring, setZimbraCalResAutoDeclineRecurring]: any = useState(
		autoRefuseOption[0]
	);
	const [schedulePolicyType, setSchedulePolicyType]: any = useState();

	const [password, setPassword]: any = useState('');
	const [repeatPassword, setRepeatPassword]: any = useState('');

	const [zimbraPrefCalendarAutoAcceptSignatureId, setZimbraPrefCalendarAutoAcceptSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDeclineSignatureId, setZimbraPrefCalendarAutoDeclineSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDenySignatureId, setZimbraPrefCalendarAutoDenySignatureId] =
		useState<any>({});
	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	useEffect(() => {
		const arrayItem: any[] = [
			{
				label: t('label.auto', 'Auto'),
				value: ''
			}
		];
		cosList.forEach((item: any) => {
			arrayItem.push({
				label: item.name,
				value: item.id
			});
		});
		setCosItems(arrayItem);
	}, [cosList, t]);

	useEffect(() => {
		const arrayItem: any[] = [
			{
				label: t('label.not_set', 'Not Set'),
				value: ''
			}
		];
		signatureData.forEach((item: any) => {
			arrayItem.push({
				label: item.name,
				value: item.id
			});
		});
		setSignatureItems(arrayItem);
	}, [signatureData, t]);

	const generateSendInviteList = (sendInviteTo: any): void => {
		if (sendInviteTo && Array.isArray(sendInviteTo)) {
			setSendInviteList(sendInviteTo);
		}
	};

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			setSignatureList(signatureResponse);
		}
	};

	const getResourceDetail = useCallback((): void => {
		getCalenderResource(selectedResourceList?.id).then((data) => {
			const resourceDetailResponse = data?.calresource[0] || {};
			const sendInviteTo = resourceDetailResponse?.a
				?.filter((value: any) => value?.n === 'zimbraPrefCalendarForwardInvitesTo')
				.map((item: any, index: any): any => {
					const id = index?.toString();
					return { ...item, id };
				});
			generateSendInviteList(sendInviteTo);
			setSendInviteData(sendInviteTo);
			setResourceInformation(resourceDetailResponse?.a);
		});
	}, [selectedResourceList?.id]);

	const getSignatureDetail = useCallback((): void => {
		getSingatures(selectedResourceList?.id).then((data) => {
			const signatureResponse = data?.Body?.GetSignaturesResponse?.signature || [];
			generateSignatureList(signatureResponse);
			setSignatureData(signatureResponse);
		});
	}, [selectedResourceList?.id]);

	useEffect(() => {
		getSignatureDetail();
	}, [getSignatureDetail]);

	useEffect(() => {
		getResourceDetail();
	}, [getResourceDetail]);

	useEffect(() => {
		if (!!resourceInformation && resourceInformation.length > 0) {
			const obj: any = {};
			resourceInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			setResourceName(obj?.displayName);
			setResourceMail(obj?.mail);
			setZimbraCalResType(
				resourceTypeOptions.find((item: any) => item.value === obj.zimbraCalResType)
			);
			setZimbraAccountStatus(
				accountStatusOptions.find((item: any) => item.value === obj.zimbraAccountStatus)
			);
			if (obj.zimbraCalResAutoDeclineRecurring) {
				setZimbraCalResAutoDeclineRecurring(
					autoRefuseOption.find((item: any) => item.value === obj.zimbraCalResAutoDeclineRecurring)
				);
			} else {
				setZimbraCalResAutoDeclineRecurring(autoRefuseOption[1]);
			}
			if (obj.zimbraCOSId) {
				const getItem = cosItems.find((item: any) => item.value === obj.zimbraCOSId);
				if (getItem) {
					setZimbraCOSId(getItem);
				} else {
					obj.zimbraCOSId = '';
					setZimbraCOSId(cosItems[0]);
				}
			} else {
				obj.zimbraCOSId = '';
				setZimbraCOSId(cosItems[0]);
			}

			if (obj.zimbraPrefCalendarAutoAcceptSignatureId) {
				const getItem = signatureItems.find(
					(item: any) => item.value === obj.zimbraPrefCalendarAutoAcceptSignatureId
				);
				if (getItem) {
					setZimbraPrefCalendarAutoAcceptSignatureId(getItem);
				} else {
					obj.zimbraPrefCalendarAutoAcceptSignatureId = '';
					setZimbraPrefCalendarAutoAcceptSignatureId(signatureItems[0]);
				}
			} else {
				obj.zimbraPrefCalendarAutoAcceptSignatureId = '';
				setZimbraPrefCalendarAutoAcceptSignatureId(signatureItems[0]);
			}
			if (obj.zimbraPrefCalendarAutoDeclineSignatureId) {
				const getItem = signatureItems.find(
					(item: any) => item.value === obj.zimbraPrefCalendarAutoDeclineSignatureId
				);
				if (getItem) {
					setZimbraPrefCalendarAutoDeclineSignatureId(getItem);
				} else {
					obj.zimbraPrefCalendarAutoDeclineSignatureId = '';
					setZimbraPrefCalendarAutoDeclineSignatureId(signatureItems[0]);
				}
			} else {
				obj.zimbraPrefCalendarAutoDeclineSignatureId = '';
				setZimbraPrefCalendarAutoDeclineSignatureId(signatureItems[0]);
			}
			if (obj.zimbraPrefCalendarAutoDenySignatureId) {
				const getItem = signatureItems.find(
					(item: any) => item.value === obj.zimbraPrefCalendarAutoDenySignatureId
				);
				if (getItem) {
					setZimbraPrefCalendarAutoDenySignatureId(getItem);
				} else {
					obj.zimbraPrefCalendarAutoDenySignatureId = '';
					setZimbraPrefCalendarAutoDenySignatureId(signatureItems[0]);
				}
			} else {
				obj.zimbraPrefCalendarAutoDenySignatureId = '';
				setZimbraPrefCalendarAutoDenySignatureId(signatureItems[0]);
			}
			if (obj.zimbraCalResMaxNumConflictsAllowed) {
				setZimbraCalResMaxNumConflictsAllowed(obj.zimbraCalResMaxNumConflictsAllowed);
			} else {
				obj.zimbraCalResMaxNumConflictsAllowed = '';
				setZimbraCalResMaxNumConflictsAllowed('');
			}
			if (obj.zimbraCalResMaxPercentConflictsAllowed) {
				setZimbraCalResMaxPercentConflictsAllowed(obj.zimbraCalResMaxPercentConflictsAllowed);
			} else {
				obj.zimbraCalResMaxPercentConflictsAllowed = '';
				setZimbraCalResMaxPercentConflictsAllowed('');
			}
			if (obj.zimbraNotes) {
				setZimbraNotes(obj.zimbraNotes);
			} else {
				obj.zimbraNotes = '';
				setZimbraNotes('');
			}
			setResourceDetailData(obj);
		}
	}, [
		resourceInformation,
		resourceTypeOptions,
		accountStatusOptions,
		autoRefuseOption,
		cosItems,
		signatureItems
	]);

	const setSchedulePolicyItem = useCallback(
		(zimbraCalResAutoAcceptDecline: any, zimbraCalResAutoDeclineIfBusy: any): any => {
			if (zimbraCalResAutoAcceptDecline === 'TRUE' && zimbraCalResAutoDeclineIfBusy === 'TRUE') {
				setSchedulePolicyType(schedulePolicyItems[0]);
			}
			if (zimbraCalResAutoAcceptDecline === 'FALSE' && zimbraCalResAutoDeclineIfBusy === 'TRUE') {
				setSchedulePolicyType(schedulePolicyItems[1]);
			}
			if (zimbraCalResAutoAcceptDecline === 'TRUE' && zimbraCalResAutoDeclineIfBusy === 'FALSE') {
				setSchedulePolicyType(schedulePolicyItems[2]);
			}
			if (zimbraCalResAutoAcceptDecline === 'FALSE' && zimbraCalResAutoDeclineIfBusy === 'FALSE') {
				setSchedulePolicyType(schedulePolicyItems[3]);
			}
		},
		[schedulePolicyItems]
	);

	useEffect(() => {
		setSchedulePolicyItem(
			resourceDetailData?.zimbraCalResAutoAcceptDecline,
			resourceDetailData?.zimbraCalResAutoDeclineIfBusy
		);
	}, [
		resourceDetailData.zimbraCalResAutoAcceptDecline,
		resourceDetailData.zimbraCalResAutoDeclineIfBusy,
		setSchedulePolicyItem
	]);

	const onResouseTypeChange = useCallback(
		(v: any): any => {
			const objItem = resourceTypeOptions.find((item: any) => item.value === v);
			if (objItem !== zimbraCalResType) {
				setZimbraCalResType(objItem);
			}
		},
		[resourceTypeOptions, zimbraCalResType]
	);

	const onAccountStatusChange = useCallback(
		(v: any): any => {
			const objItem = accountStatusOptions.find((item: any) => item.value === v);
			if (objItem !== zimbraAccountStatus) {
				setZimbraAccountStatus(objItem);
			}
		},
		[accountStatusOptions, zimbraAccountStatus]
	);

	const onAutoRefuseChange = useCallback(
		(v: any): any => {
			const objItem = autoRefuseOption.find((item: any) => item.value === v);
			if (objItem !== zimbraCalResAutoDeclineRecurring) {
				setZimbraCalResAutoDeclineRecurring(objItem);
			}
		},
		[autoRefuseOption, zimbraCalResAutoDeclineRecurring]
	);

	const onCosChange = useCallback(
		(v: any): any => {
			const objItem = cosItems.find((item: any) => item.value === v);
			if (objItem !== zimbraCOSId) {
				setZimbraCOSId(objItem);
			}
		},
		[cosItems, zimbraCOSId]
	);

	const onSchedulePolicyChange = useCallback(
		(v: any): any => {
			const objItem = schedulePolicyItems.find((item: any) => item.value === v);
			if (objItem !== schedulePolicyType) {
				setSchedulePolicyType(objItem);
			}
		},
		[schedulePolicyItems, schedulePolicyType]
	);

	useEffect(() => {
		if (
			resourceDetailData?.displayName !== undefined &&
			resourceDetailData?.displayName !== resourceName
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.displayName, resourceName]);

	useEffect(() => {
		if (resourceDetailData?.mail !== undefined && resourceDetailData?.mail !== resourceMail) {
			setIsDirty(true);
		}
	}, [resourceDetailData.mail, resourceMail]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraNotes !== undefined &&
			resourceDetailData?.zimbraNotes !== zimbraNotes
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraNotes, zimbraNotes]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCalResMaxPercentConflictsAllowed !== undefined &&
			resourceDetailData?.zimbraCalResMaxPercentConflictsAllowed !==
				zimbraCalResMaxPercentConflictsAllowed
		) {
			setIsDirty(true);
		}
	}, [
		resourceDetailData.zimbraCalResMaxPercentConflictsAllowed,
		zimbraCalResMaxPercentConflictsAllowed
	]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCalResMaxNumConflictsAllowed !== undefined &&
			resourceDetailData?.zimbraCalResMaxNumConflictsAllowed !== zimbraCalResMaxNumConflictsAllowed
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraCalResMaxNumConflictsAllowed, zimbraCalResMaxNumConflictsAllowed]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCOSId !== undefined &&
			resourceDetailData?.zimbraCOSId !== zimbraCOSId?.value
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraCOSId, zimbraCOSId]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraPrefCalendarAutoAcceptSignatureId !== undefined &&
			zimbraPrefCalendarAutoAcceptSignatureId?.value !== undefined &&
			resourceDetailData?.zimbraPrefCalendarAutoAcceptSignatureId !==
				zimbraPrefCalendarAutoAcceptSignatureId?.value
		) {
			setIsDirty(true);
		}
	}, [
		resourceDetailData.zimbraPrefCalendarAutoAcceptSignatureId,
		zimbraPrefCalendarAutoAcceptSignatureId
	]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraPrefCalendarAutoDeclineSignatureId !== undefined &&
			zimbraPrefCalendarAutoDeclineSignatureId?.value !== undefined &&
			resourceDetailData?.zimbraPrefCalendarAutoDeclineSignatureId !==
				zimbraPrefCalendarAutoDeclineSignatureId?.value
		) {
			setIsDirty(true);
		}
	}, [
		resourceDetailData.zimbraPrefCalendarAutoDeclineSignatureId,
		zimbraPrefCalendarAutoDeclineSignatureId
	]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraPrefCalendarAutoDenySignatureId !== undefined &&
			zimbraPrefCalendarAutoDenySignatureId?.value !== undefined &&
			resourceDetailData?.zimbraPrefCalendarAutoDenySignatureId !==
				zimbraPrefCalendarAutoDenySignatureId?.value
		) {
			setIsDirty(true);
		}
	}, [
		resourceDetailData.zimbraPrefCalendarAutoDenySignatureId,
		zimbraPrefCalendarAutoDenySignatureId
	]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCalResType !== undefined &&
			resourceDetailData?.zimbraCalResType !== zimbraCalResType?.value
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraCalResType, zimbraCalResType]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraAccountStatus !== undefined &&
			resourceDetailData?.zimbraAccountStatus !== zimbraAccountStatus?.value
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraAccountStatus, zimbraAccountStatus]);

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCalResAutoDeclineRecurring !== undefined &&
			resourceDetailData?.zimbraCalResAutoDeclineRecurring !==
				zimbraCalResAutoDeclineRecurring?.value
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.zimbraCalResAutoDeclineRecurring, zimbraCalResAutoDeclineRecurring]);

	useEffect(() => {
		if (
			resourceDetailData?.schedulePolicyType !== undefined &&
			resourceDetailData?.schedulePolicyType !== schedulePolicyType?.value
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.schedulePolicyType, schedulePolicyType]);

	useEffect(() => {
		if (!_.isEqual(sendInviteData, sendInviteList)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [sendInviteData, sendInviteList]);

	const onCancel = (): void => {
		setResourceName(resourceDetailData?.displayName);
		setResourceMail(resourceDetailData?.mail);
		setZimbraNotes(resourceDetailData?.zimbraNotes);
		setZimbraCalResMaxNumConflictsAllowed(resourceDetailData?.zimbraCalResMaxNumConflictsAllowed);
		setZimbraCalResMaxPercentConflictsAllowed(
			resourceDetailData?.zimbraCalResMaxPercentConflictsAllowed
		);
		setZimbraCOSId(cosItems.find((item: any) => item.value === resourceDetailData?.zimbraCOSId));
		setZimbraCalResType(
			resourceTypeOptions.find((item: any) => item.value === resourceDetailData?.zimbraCalResType)
		);
		setZimbraAccountStatus(
			accountStatusOptions.find(
				(item: any) => item.value === resourceDetailData?.zimbraAccountStatus
			)
		);
		setZimbraCalResAutoDeclineRecurring(
			autoRefuseOption.find(
				(item: any) => item.value === resourceDetailData.zimbraCalResAutoDeclineRecurring
			)
		);
		setZimbraPrefCalendarAutoAcceptSignatureId(
			signatureItems.find(
				(item: any) => item.value === resourceDetailData.zimbraPrefCalendarAutoAcceptSignatureId
			)
		);
		setZimbraPrefCalendarAutoDeclineSignatureId(
			signatureItems.find(
				(item: any) => item.value === resourceDetailData.zimbraPrefCalendarAutoDeclineSignatureId
			)
		);
		setZimbraPrefCalendarAutoDenySignatureId(
			signatureItems.find(
				(item: any) => item.value === resourceDetailData.zimbraPrefCalendarAutoDenySignatureId
			)
		);
		setSchedulePolicyItem(
			resourceDetailData?.zimbraCalResAutoAcceptDecline,
			resourceDetailData?.zimbraCalResAutoDeclineIfBusy
		);
		setSendInviteList(sendInviteData);
		setPassword('');
		setRepeatPassword('');
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
			setIsDirty(false);
			setShowResourceEditDetailView(false);
			setIsUpdateRecord(true);
		});
	};

	const onSave = (): void => {
		if (password !== '' && password?.length < 6) {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: t('label.password_lenght_msg', 'Password should be more than 5 character'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		} else if (password !== repeatPassword) {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: t('label.password_and repeat_password_not_match', 'Passwords do not match'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		} else {
			const attributes: any[] = [];
			const requests: any[] = [];
			if (password !== '' && password === repeatPassword) {
				requests.push(setPasswordRequest(selectedResourceList.id, password));
			}
			if (resourceDetailData?.mail !== resourceMail) {
				requests.push(renameCalendarResource(selectedResourceList.id, resourceMail));
			}

			attributes.push({
				n: 'displayName',
				_content: resourceName
			});
			attributes.push({
				n: 'zimbraNotes',
				_content: zimbraNotes
			});
			attributes.push({
				n: 'zimbraCalResMaxNumConflictsAllowed',
				_content: zimbraCalResMaxNumConflictsAllowed
			});
			attributes.push({
				n: 'zimbraCalResMaxPercentConflictsAllowed',
				_content: zimbraCalResMaxPercentConflictsAllowed
			});
			attributes.push({
				n: 'zimbraCOSId',
				_content: zimbraCOSId?.value
			});
			attributes.push({
				n: 'zimbraPrefCalendarAutoAcceptSignatureId',
				_content: zimbraPrefCalendarAutoAcceptSignatureId?.value
			});
			attributes.push({
				n: 'zimbraPrefCalendarAutoDeclineSignatureId',
				_content: zimbraPrefCalendarAutoDeclineSignatureId?.value
			});
			attributes.push({
				n: 'zimbraPrefCalendarAutoDenySignatureId',
				_content: zimbraPrefCalendarAutoDenySignatureId?.value
			});
			attributes.push({
				n: 'zimbraCalResType',
				_content: zimbraCalResType?.value
			});
			attributes.push({
				n: 'zimbraAccountStatus',
				_content: zimbraAccountStatus?.value
			});
			attributes.push({
				n: 'zimbraCalResAutoDeclineRecurring',
				_content: zimbraCalResAutoDeclineRecurring?.value
			});
			attributes.push({
				n: 'zimbraCalResAutoAcceptDecline',
				_content: schedulePolicyType?.value === (1 || 3) ? 'TRUE' : 'FALSE'
			});
			attributes.push({
				n: 'zimbraCalResAutoDeclineIfBusy',
				_content: schedulePolicyType?.value === (1 || 2) ? 'TRUE' : 'FALSE'
			});
			sendInviteList.forEach((item: any) => {
				attributes.push({
					n: 'zimbraPrefCalendarForwardInvitesTo',
					_content: item?._content
				});
			});
			requests.push(modifyCalendarResource(selectedResourceList?.id, attributes));
			if (requests.length > 0) {
				callAllRequest(requests);
			}
		}
	};

	const onDeleteResource = useCallback(() => {
		setIsOpenDeleteDialog(true);
	}, []);

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
			setIsRequestInProgress(false);
			closeHandler();
			setShowResourceEditDetailView(false);
			setIsUpdateRecord(true);
		},
		[closeHandler, createSnackbar, setIsUpdateRecord, setShowResourceEditDetailView]
	);

	const onDeleteHandler = useCallback(() => {
		setIsRequestInProgress(true);
		deleteCalendarResource(selectedResourceList?.id)
			.then((data: any) => {
				onSuccess(
					t(
						'label.resource_deleted_successfully',
						'The {{resource_name}} has been deleted successfully',
						{
							resource_name: selectedResourceList?.name
						}
					)
				);
			})
			.then((error: any) => {
				setIsRequestInProgress(false);
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
	}, [selectedResourceList?.id, selectedResourceList?.name, onSuccess, t, createSnackbar]);

	const onDisableResource = useCallback(() => {
		setIsRequestInProgress(true);
		const attributes: any[] = [];
		attributes.push({
			n: 'zimbraAccountStatus',
			_content: STATUS.CLOSED
		});
		modifyCalendarResource(selectedResourceList?.id, attributes)
			.then((data) => {
				if (data?.calresource && Array.isArray(data?.calresource)) {
					onSuccess(
						t(
							'label.resource_disable_successfully',
							'The {{resource_name}} has been disabled successfully.',
							{
								resource_name: selectedResourceList?.name
							}
						)
					);
				}
			})
			.catch((error) => {
				setIsRequestInProgress(false);
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
	}, [selectedResourceList?.id, selectedResourceList?.name, onSuccess, t, createSnackbar]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '43px',
				right: '0px',
				bottom: '0px',
				left: `${'max(calc(100% - 680px), 12px)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				maxHeight: '100%',
				overflow: 'hidden',
				boxShadow: '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
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
						{selectedResourceList?.name}
					</Text>
				</Row>
				<Row>
					{isEditMode && isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="large">
								<Button
									label={t('label.cancel', 'Cancel')}
									color="secondary"
									height="44px"
									onClick={onCancel}
								/>
							</Padding>
							<Button
								label={t('label.save', 'Save')}
								color="primary"
								height="44px"
								onClick={onSave}
							/>
						</Container>
					)}
				</Row>
				<Row padding={{ right: 'extrasmall', left: 'small' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => {
							setShowResourceEditDetailView(false);
							setIsEditMode(false);
						}}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>
			{!isEditMode && (
				<Row
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					orientation="horizontal"
					background="white"
					height="fit"
					padding={{ top: 'extralarge', left: 'large', right: 'large', bottom: 'large' }}
					width="100%"
				>
					<Padding right="large">
						<Container width="fit" height="fit" style={{ border: '1px solid #2b73d2' }}>
							<IconButton
								iconColor="primary"
								backgroundColor="gray6"
								icon="EditAsNewOutline"
								height={42}
								width={42}
								onClick={(): void => setIsEditMode(true)}
							/>
						</Container>
					</Padding>

					<Padding right="large">
						<Container width="fit" height="fit" style={{ border: '1px solid #d74942' }}>
							<IconButton
								iconColor="error"
								backgroundColor="gray6"
								icon="Trash2Outline"
								height={42}
								width={42}
								onClick={onDeleteResource}
							/>
						</Container>
					</Padding>

					<Button
						label={t('label.view_mail', 'VIEW MAIL')}
						icon="EmailReadOutline"
						color="primary"
						type="outlined"
						height={44}
						disabled
					/>
				</Row>
			)}

			<Container
				padding={{ left: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100% - 64px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.resource', 'Resource')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.name', 'Name')}
								backgroundColor={!isEditMode ? 'gray6' : 'gray5'}
								value={resourceName}
								size="medium"
								readOnly={!isEditMode}
								onChange={
									isEditMode
										? (e: any): any => {
												setResourceName(e.target.value);
										  }
										: undefined
								}
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ left: 'small' }}>
							<Input
								label={t('label.email', 'Email')}
								backgroundColor={!isEditMode ? 'gray6' : 'gray5'}
								value={resourceMail}
								size="medium"
								readOnly={!isEditMode}
								onChange={
									isEditMode
										? (e: any): any => {
												setResourceMail(e.target.value);
										  }
										: undefined
								}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.server', 'Server')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraMailHost}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ left: 'small' }}>
							{isEditMode && (
								<Select
									items={resourceTypeOptions}
									background="gray5"
									label={t('label.type', 'Type')}
									showCheckbox={false}
									onChange={onResouseTypeChange}
									selection={zimbraCalResType}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.type', 'Type')}
									backgroundColor="gray6"
									value={zimbraCalResType.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ right: 'small' }}>
							{isEditMode && (
								<Select
									items={accountStatusOptions}
									background="gray5"
									label={t('label.status', 'Status')}
									showCheckbox={false}
									onChange={onAccountStatusChange}
									selection={zimbraAccountStatus}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.status', 'Status')}
									backgroundColor="gray6"
									value={zimbraAccountStatus?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ left: 'small' }}>
							{isEditMode && (
								<Select
									items={cosItems}
									background="gray5"
									label={t('label.class_of_service', 'Class of Service')}
									showCheckbox={false}
									onChange={onCosChange}
									selection={zimbraCOSId}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.class_of_service', 'Class of Service')}
									backgroundColor="gray6"
									value={zimbraCOSId?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							{isEditMode && (
								<Select
									items={autoRefuseOption}
									background="gray5"
									label={t('label.auto_refuse', 'Auto-Refuse')}
									showCheckbox={false}
									onChange={onAutoRefuseChange}
									selection={zimbraCalResAutoDeclineRecurring}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.auto_refuse', 'Auto-Refuse')}
									backgroundColor="gray6"
									value={zimbraCalResAutoDeclineRecurring?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							{isEditMode && (
								<Select
									items={schedulePolicyItems}
									background="gray5"
									label={t('label.schedule_policy', 'Set Policy')}
									showCheckbox={false}
									onChange={onSchedulePolicyChange}
									selection={schedulePolicyType}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.schedule_policy', 'Set Policy')}
									backgroundColor="gray6"
									value={schedulePolicyType?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.maximum_conflict_allowed', 'Maximum Conflict Allowed')}
								backgroundColor={!isEditMode ? 'gray6' : 'gray5'}
								value={zimbraCalResMaxNumConflictsAllowed}
								size="medium"
								onChange={
									isEditMode
										? (e: any): any => {
												setZimbraCalResMaxNumConflictsAllowed(e.target.value);
										  }
										: undefined
								}
								readOnly={!isEditMode}
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ left: 'small' }}>
							<Input
								label={t('label.percentage_maximum_conflict_allowed', '% Maximum Conflict Allowed')}
								backgroundColor={!isEditMode ? 'gray6' : 'gray5'}
								value={zimbraCalResMaxPercentConflictsAllowed}
								onChange={
									isEditMode
										? (e: any): any => {
												setZimbraCalResMaxPercentConflictsAllowed(e.target.value);
										  }
										: undefined
								}
								readOnly={!isEditMode}
							/>
						</Row>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.id_lbl', 'ID')}
								backgroundColor="gray6"
								value={selectedResourceList?.id}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%" padding={{ left: 'small' }}>
							<Input
								label={t('label.creation_date', 'Creation Date')}
								backgroundColor="gray6"
								value={
									resourceDetailData?.zimbraCreateTimestamp
										? moment(resourceDetailData?.zimbraCreateTimestamp, 'YYYYMMDDHHmmss.Z').format(
												'DD MMM YYYY | hh:MM:SS A'
										  )
										: '--'
								}
								readOnly
							/>
						</Row>
					</Container>
				</ListRow>
				{isEditMode && (
					<>
						<Row width="100%" padding={{ top: 'medium' }}>
							<Divider color="gray3" />
						</Row>
						<Row padding={{ top: 'extralarge' }}>
							<Text
								size="small"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								weight="bold"
							>
								{t('label.password', 'Password')}
							</Text>
						</Row>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large' }}
							>
								<Row width="100%">
									<Input
										label={t('label.password', 'Password')}
										backgroundColor="gray5"
										value={password}
										inputName="password"
										type="password"
										onChange={(e: any): any => {
											setPassword(e.target.value);
											setIsDirty(true);
										}}
									/>
								</Row>
							</Container>
						</ListRow>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'large' }}
							>
								<Row width="100%">
									<Input
										label={t('label.repeat_password', 'Repeat Password')}
										backgroundColor="gray5"
										value={repeatPassword}
										inputName="repeatPassword"
										type="password"
										onChange={(e: any): any => {
											setRepeatPassword(e.target.value);
											setIsDirty(true);
										}}
									/>
								</Row>
							</Container>
						</ListRow>
					</>
				)}
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<SendInviteAccounts
					isEditable={isEditMode}
					sendInviteList={sendInviteList}
					setSendInviteList={setSendInviteList}
				/>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<SignatureDetail
					isEditable={isEditMode}
					signatureList={signatureList}
					setSignatureList={setSignatureList}
					signatureItems={signatureItems}
					setSignatureItems={setSignatureItems}
					resourceId={selectedResourceList?.id}
					zimbraPrefCalendarAutoAcceptSignatureId={zimbraPrefCalendarAutoAcceptSignatureId}
					setZimbraPrefCalendarAutoAcceptSignatureId={setZimbraPrefCalendarAutoAcceptSignatureId}
					zimbraPrefCalendarAutoDeclineSignatureId={zimbraPrefCalendarAutoDeclineSignatureId}
					setZimbraPrefCalendarAutoDeclineSignatureId={setZimbraPrefCalendarAutoDeclineSignatureId}
					zimbraPrefCalendarAutoDenySignatureId={zimbraPrefCalendarAutoDenySignatureId}
					setZimbraPrefCalendarAutoDenySignatureId={setZimbraPrefCalendarAutoDenySignatureId}
				/>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				{isEditMode && (
					<Row padding={{ top: 'extralarge' }} width="100%">
						<Textarea
							label={t('label.notes', 'Notes')}
							backgroundColor="gray5"
							value={zimbraNotes}
							size="medium"
							onChange={(e: any): any => {
								setZimbraNotes(e.target.value);
							}}
						/>
					</Row>
				)}
				{!isEditMode && (
					<>
						<Row padding={{ top: 'extralarge' }}>
							<Text
								size="small"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								weight="bold"
							>
								{t('label.notes', 'Notes')}
							</Text>
						</Row>
						<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
							<Text size="small">{resourceDetailData?.zimbraNotes}</Text>
						</Row>
					</>
				)}
			</Container>
			{isOpenDeleteDialog && (
				<Modal
					size="medium"
					title={t('label.deleting_resource_name', 'You are deleting {{name}}', {
						name: selectedResourceList?.name
					})}
					open={isOpenDeleteDialog}
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button
								style={{ marginLeft: '10px' }}
								type="outlined"
								label={t('label.help', 'Help')}
								color="primary"
							/>
							<Row style={{ gap: '8px' }}>
								<Button
									label={t('label.delete_it_instead', 'Delete it instead')}
									color="error"
									type="outlined"
									onClick={onDeleteHandler}
									disabled={isRequestInProgress}
								/>
								<Button
									label={t('label.close_the_resource', 'Close the resource')}
									color="primary"
									onClick={onDisableResource}
									disabled={isRequestInProgress || zimbraAccountStatus?.value === STATUS.CLOSED}
								/>
							</Row>
						</Container>
					}
					showCloseIcon
					onClose={closeHandler}
				>
					<Container>
						<Padding bottom="medium" top="medium">
							<Text size={'extralarge'} overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_1"
									defaults="Are you sure you want to delete <bold>{{name}}</bod> ?"
									components={{ bold: <strong />, name: selectedResourceList?.name }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_2"
									defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_3"
									defaults="You can <bold>Disable it to preserve</bold> the data, instead."
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Padding>
						<Row padding={{ bottom: 'large' }}>
							<Icon
								icon="AlertTriangleOutline"
								size="large"
								style={{ height: '48px', width: '48px' }}
							/>
						</Row>
					</Container>
				</Modal>
			)}
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

export default ResourceEditDetailView;
