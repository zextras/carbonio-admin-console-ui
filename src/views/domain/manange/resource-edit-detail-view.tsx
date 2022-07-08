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
	Table,
	Select,
	Button,
	Padding,
	PasswordInput,
	Modal,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import ListRow from '../../list/list-row';
import { getCalenderResource } from '../../../services/get-cal-resource-service';
import { getSingatures } from '../../../services/get-signature-service';
import { useDomainStore } from '../../../store/domain/store';
import { createSignature } from '../../../services/create-signature-service';
import { setPasswordRequest } from '../../../services/set-password-service';
import { renameCalendarResource } from '../../../services/rename-cal-resource-service';
import { modifyCalendarResource } from '../../../services/modify-cal-resource-service';
import Textarea from '../../components/textarea';
import { modifySignature } from '../../../services/modify-signature-service';

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
	const [defaultSendInviteList, setDefaultSendInviteList] = useState<any[]>([]);
	const [signatureData, setSignatureData]: any = useState([]);
	const [sendInviteData, setSendInviteData]: any = useState([]);
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
	const [description, setDescription] = useState<string>('');
	const [selectedRows, setSelectedRows] = useState<any>([]);
	const [newSentInviteValue, setNewSentInviteValue] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const sendInviteHeaders: any[] = useMemo(
		() => [
			{
				id: 'account',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);
	const [signatureListRows, setSignatureListRows] = useState<any[]>([]);
	const signatureHeaders: any[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.name', 'Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

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
	const [searchAccountName, setSearchAccountName]: any = useState('');
	const [searchSignatureName, setSearchSignatureName]: any = useState('');

	const [sendInviteAddBtnDisabled, setSendInviteAddBtnDisabled] = useState(true);
	const [sendInviteDeleteBtnDisabled, setSendInviteDeleteBtnDisabled] = useState(true);

	const [password, setPassword]: any = useState('');
	const [repeatPassword, setRepeatPassword]: any = useState('');
	const [isOpenCreateEditSignatureDialog, setIsOpenCreateEditSignatureDialog] =
		useState<boolean>(false);
	const [signatureName, setSignatureName] = useState<string>('');
	const [signatureContent, setSignatureContent] = useState<string>('');

	const [zimbraPrefCalendarAutoAcceptSignatureId, setZimbraPrefCalendarAutoAcceptSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDeclineSignatureId, setZimbraPrefCalendarAutoDeclineSignatureId] =
		useState<any>({});
	const [zimbraPrefCalendarAutoDenySignatureId, setZimbraPrefCalendarAutoDenySignatureId] =
		useState<any>({});
	const [selectedSignature, setSelectedSignature] = useState<any>([]);
	const [signatureList, setSignatureList] = useState<any[]>([]);
	const [isEditSignature, setIsEditSignature] = useState<boolean>(false);

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
			const sList: any[] = [];
			sendInviteTo.forEach((item: any, index: number) => {
				sList.push({
					id: index?.toString(),
					columns: [
						<Text size="medium" weight="light" key={index} color="gray0">
							{item?._content}
						</Text>
					],
					item,
					label: item?._content,
					clickable: true
				});
			});
			setSendInviteList(sList);
			setDefaultSendInviteList(sList);
		}
	};

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			setSignatureList(signatureResponse);
		}
	};

	useEffect(() => {
		const sList: any[] = [];
		signatureList.forEach((item: any) => {
			sList.push({
				id: item?.id,
				columns: [
					<Text size="medium" weight="light" key={`${item?.id}-name`} color="gray0">
						{item?.name}
					</Text>
				],
				item,
				label: item?.name,
				clickable: true
			});
		});
		setSignatureListRows(sList);
	}, [signatureList]);

	const getResourceDetail = useCallback((): void => {
		getCalenderResource(selectedResourceList?.id)
			.then((response) => response.json())
			.then((data) => {
				const resourceDetailResponse =
					data?.Body?.GetCalendarResourceResponse?.calresource[0] || {};
				const sendInviteTo = resourceDetailResponse?.a?.filter(
					(value: any) => value?.n === 'zimbraPrefCalendarForwardInvitesTo'
				);
				generateSendInviteList(sendInviteTo);
				setSendInviteData(sendInviteTo);
				setResourceInformation(resourceDetailResponse?.a);
			});
	}, [selectedResourceList?.id]);

	const getSignatureDetail = useCallback((): void => {
		getSingatures(selectedResourceList?.id)
			.then((response) => response.json())
			.then((data) => {
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
			if (obj.description) {
				setDescription(obj.description);
			} else {
				obj.description = '';
				setDescription('');
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

	const onResouseTypeChange = (v: any): any => {
		const objItem = resourceTypeOptions.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraCalResType(objItem);
		}
	};

	const onAccountStatusChange = (v: any): any => {
		const objItem = accountStatusOptions.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraAccountStatus(objItem);
		}
	};

	const onAutoRefuseChange = (v: any): any => {
		const objItem = autoRefuseOption.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraCalResAutoDeclineRecurring(objItem);
		}
	};

	const onCosChange = (v: any): any => {
		const objItem = cosItems.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraCOSId(objItem);
		}
	};

	const onZimbraAutoAcceptSignatureChange = (v: any): any => {
		const objItem = signatureItems.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraPrefCalendarAutoAcceptSignatureId(objItem);
		}
	};

	const onZimbraAutoDeclineSignatureChange = (v: any): any => {
		const objItem = signatureItems.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraPrefCalendarAutoDeclineSignatureId(objItem);
		}
	};

	const onZimbraAutoDenySignatureChange = (v: any): any => {
		const objItem = signatureItems.find((item: any) => item.value === v);
		if (objItem) {
			setZimbraPrefCalendarAutoDenySignatureId(objItem);
		}
	};

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
		if (searchSignatureName) {
			const filterList = signatureData.filter((item: any) =>
				item?.name?.includes(searchSignatureName)
			);
			generateSignatureList(filterList);
		} else {
			generateSignatureList(signatureData);
		}
	}, [searchSignatureName, signatureData]);

	useEffect(() => {
		if (searchAccountName) {
			const filterList = sendInviteData.filter((item: any) =>
				item?._content?.includes(searchAccountName)
			);
			generateSendInviteList(filterList);
		} else {
			generateSendInviteList(sendInviteData);
		}
	}, [searchAccountName, sendInviteData]);

	const addSendInviteAccount = useCallback((): void => {
		if (newSentInviteValue) {
			const lastId = sendInviteList.length > 0 ? sendInviteList[sendInviteList.length - 1].id : 0;
			const newId = lastId + 1;
			const item = {
				id: newId.toString(),
				columns: [
					<Text size="medium" weight="light" key={newId} color="gray0">
						{newSentInviteValue}
					</Text>
				],
				label: newSentInviteValue,
				clickable: true
			};
			setSendInviteList([...sendInviteList, item]);
			setSendInviteAddBtnDisabled(true);
			setNewSentInviteValue('');
		}
	}, [newSentInviteValue, sendInviteList]);

	const deleteSendInviteAccount = useCallback((): void => {
		if (selectedRows && selectedRows.length > 0) {
			const filterItems = sendInviteList.filter((item: any) => !selectedRows.includes(item.id));
			setSendInviteList(filterItems);
			setSendInviteDeleteBtnDisabled(true);
			setSelectedRows([]);
		}
	}, [selectedRows, sendInviteList]);

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
			resourceDetailData?.description !== undefined &&
			resourceDetailData?.description !== description
		) {
			setIsDirty(true);
		}
	}, [resourceDetailData.description, description]);

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
		if (!_.isEqual(defaultSendInviteList, sendInviteList)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [defaultSendInviteList, sendInviteList]);

	const onCancel = (): void => {
		setResourceName(resourceDetailData?.displayName);
		setResourceMail(resourceDetailData?.mail);
		setZimbraNotes(resourceDetailData?.zimbraNotes);
		setDescription(resourceDetailData?.description);
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
		setSendInviteList(defaultSendInviteList);
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
				label: t('label.password_lenght_msg', 'Password should be more then 5 character'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		} else if (password !== repeatPassword) {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: t(
					'label.password_and repeat_password_not_match',
					'Password and repeat password not match'
				),
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
				n: 'description',
				_content: description
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
					_content: item.label
				});
			});
			requests.push(modifyCalendarResource(selectedResourceList?.id, attributes));
			if (requests.length > 0) {
				callAllRequest(requests);
			}
		}
	};

	const _createSignature = useCallback((): void => {
		createSignature(selectedResourceList?.id, signatureName, signatureContent)
			.then((response) => response.json())
			.then((data) => {
				const signatureItem = data?.Body?.CreateSignatureResponse?.signature[0];
				if (signatureItem?.id) {
					const item = {
						content: [
							{
								type: 'text/plain',
								_content: signatureContent
							}
						],
						id: signatureItem?.id,
						name: signatureItem?.name
					};
					const _signatureList = signatureList;
					_signatureList.push(item);
					setSignatureList([]);
					setSignatureList(_signatureList);
				}
				setIsOpenCreateEditSignatureDialog(false);
			});
	}, [selectedResourceList?.id, signatureName, signatureContent, signatureList]);

	const _modifySignature = useCallback(() => {
		modifySignature(selectedResourceList?.id, selectedSignature[0], signatureName, signatureContent)
			.then((response) => response.json())
			.then((data) => {
				const _signature = data?.Body?.ModifySignatureResponse;
				if (_signature) {
					const allSignature = signatureList.map((item: any) => {
						if (item?.id === selectedSignature[0]) {
							// eslint-disable-next-line no-param-reassign
							item.content = [
								{
									type: 'text/plain',
									_content: signatureContent
								}
							];
							// eslint-disable-next-line no-param-reassign
							item.name = signatureName;
						}
						return item;
					});
					setSignatureList([]);
					setSignatureList(allSignature);
				}
				setIsOpenCreateEditSignatureDialog(false);
			});
	}, [selectedResourceList?.id, signatureName, selectedSignature, signatureContent, signatureList]);

	const onSaveOrEditSignature = useCallback(() => {
		if (isEditSignature) {
			_modifySignature();
		} else {
			_createSignature();
		}
	}, [_createSignature, _modifySignature, isEditSignature]);

	const onEditSignature = useCallback(() => {
		const _signature = signatureList.find((item: any) => item?.id === selectedSignature[0]);
		if (_signature && _signature?.id) {
			const content = _signature?.content;
			if (content && content[0]?._content) {
				setSignatureContent(content[0]?._content);
			}
			if (_signature?.name) {
				setSignatureName(_signature?.name);
			}
			setIsEditSignature(true);
			setIsOpenCreateEditSignatureDialog(true);
		}
	}, [selectedSignature, signatureList]);

	useEffect(() => {
		if (!isOpenCreateEditSignatureDialog) {
			setIsEditSignature(false);
			setSignatureContent('');
			setSignatureName('');
		}
	}, [isOpenCreateEditSignatureDialog]);

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
				height="48px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{selectedResourceList?.name}
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
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
							/>
						</Container>
					</Padding>

					<Button
						label={t('label.view_mail', 'VIEW MAIL')}
						icon="EmailReadOutline"
						color="primary"
						type="outlined"
						height={44}
					/>
				</Row>
			)}
			{isEditMode && isDirty && (
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
						<Button
							label={t('label.cancel', 'Cancel')}
							color="secondary"
							height="44px"
							onClick={onCancel}
						/>
					</Padding>
					<Button label={t('label.save', 'Save')} color="primary" height="44px" onClick={onSave} />
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="BulbOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="EmailOutline" size="large" color="gray0" />
						</Row>
						<Row width="90%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HardDriveOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CubeOutline" size="large" color="gray0" />
						</Row>
						<Row width="90%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon
								icon="DashboardOutline"
								size="large"
								color={STATUS_COLOR[resourceDetailData?.zimbraAccountStatus]?.color}
							/>
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CosOutline" size="large" color="gray0" />
						</Row>
						<Row width="90%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HistoryOutline" size="large" color="gray0" />
						</Row>
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="ClockOutline" size="large" color="gray0" />
						</Row>
						<Row width="100%">
							{isEditMode && (
								<Select
									items={schedulePolicyItems}
									background="gray5"
									label={t('label.schedule_policy', 'Schedule Policy')}
									showCheckbox={false}
									onChange={onSchedulePolicyChange}
									selection={schedulePolicyType}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.schedule_policy', 'Schedule Policy')}
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.maximum_conflict_allowed', 'Maximun Conflict Allowed')}
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="90%">
							<Input
								label={t('label.percentage_maximum_conflict_allowed', '% Maximun Conflict Allowed')}
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FingerPrintOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CalendarOutline" size="large" color="gray0" />
						</Row>
						<Row width="90%">
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
									<PasswordInput
										label={t('label.password', 'Password')}
										backgroundColor="gray5"
										value={password}
										inputName="password"
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
									<PasswordInput
										label={t('label.repeat_password', 'Repeat Password')}
										backgroundColor="gray5"
										value={repeatPassword}
										inputName="repeatPassword"
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
				<Row padding={{ top: 'extralarge' }}>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.send_invite_to', 'Send Invite To')}
					</Text>
				</Row>
				{isEditMode && (
					<ListRow>
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-start"
							width="100%"
							wrap="nowrap"
							padding={{ top: 'large' }}
						>
							<Input
								label={t('label.enter_email_address', 'Enter E-mail address')}
								background="gray5"
								value={newSentInviteValue}
								onChange={(e: any): any => {
									setNewSentInviteValue(e.target.value);
									setSendInviteAddBtnDisabled(false);
								}}
							/>

							<Padding left="large">
								<Button
									type="outlined"
									label={t('label.add', 'Add')}
									icon="Plus"
									color="primary"
									height="44px"
									disabled={sendInviteAddBtnDisabled}
									onClick={addSendInviteAccount}
								/>
							</Padding>
							<Padding left="large">
								<Button
									type="outlined"
									label={t('label.delete', 'Delete')}
									icon="Close"
									color="error"
									height="44px"
									disabled={sendInviteDeleteBtnDisabled}
									onClick={deleteSendInviteAccount}
								/>
							</Padding>
						</Row>
					</ListRow>
				)}
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_an_account', 'Search an account')}
								backgroundColor="gray5"
								value={searchAccountName}
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
								onChange={(e: any): any => {
									setSearchAccountName(e.target.value);
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
						<Table
							rows={sendInviteList}
							headers={sendInviteHeaders}
							showCheckbox={!!isEditMode}
							style={{ overflow: 'auto', height: '100%' }}
							selectedRows={selectedRows}
							onSelectionChange={(selected: any): any => {
								setSelectedRows(selected);
								if (selected && selected.length > 0) {
									setSendInviteDeleteBtnDisabled(false);
								} else {
									setSendInviteDeleteBtnDisabled(true);
								}
							}}
						/>
					</Container>
				</ListRow>
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
						{t('label.signatures', 'Signatures')}
					</Text>
				</Row>
				{isEditMode && (
					<ListRow>
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-end"
							width="100%"
							wrap="nowrap"
							padding={{ top: 'large' }}
						>
							<Padding>
								<Button
									type="outlined"
									label={t('label.add', 'Add')}
									icon="Plus"
									color="primary"
									height="44px"
									onClick={(): void => {
										setIsOpenCreateEditSignatureDialog(true);
									}}
								/>
							</Padding>
							<Padding left="large">
								<Button
									type="outlined"
									label={t('label.edit', 'Edit')}
									icon="Edit"
									color="secondary"
									height="44px"
									disabled={selectedSignature.length === 0 || selectedSignature.length > 1}
									onClick={onEditSignature}
								/>
							</Padding>
							<Padding left="large">
								<Button
									type="outlined"
									label={t('label.delete', 'Delete')}
									icon="Close"
									color="error"
									height="44px"
								/>
							</Padding>
						</Row>
					</ListRow>
				)}
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="100%">
							<Input
								label={t('label.search_a_signature', 'Search a signature')}
								backgroundColor="gray5"
								value={searchSignatureName}
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
								onChange={(e: any): any => {
									setSearchSignatureName(e.target.value);
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
						<Table
							rows={signatureListRows}
							headers={signatureHeaders}
							showCheckbox={false}
							style={{ overflow: 'auto', height: '100%' }}
							selectedRows={selectedSignature}
							onSelectionChange={(selected: any): void => setSelectedSignature(selected)}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-between"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="30%">
							{isEditMode && (
								<Select
									items={signatureItems}
									background="gray5"
									label={t('label.auto_accept', 'Auto-Accept')}
									showCheckbox={false}
									onChange={onZimbraAutoAcceptSignatureChange}
									selection={zimbraPrefCalendarAutoAcceptSignatureId}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.auto_accept', 'Auto-Accept')}
									backgroundColor="gray6"
									value={zimbraPrefCalendarAutoAcceptSignatureId?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
						<Row width="30%">
							{isEditMode && (
								<Select
									items={signatureItems}
									background="gray5"
									label={t('label.auto_refuse', 'Auto-Refuse')}
									showCheckbox={false}
									onChange={onZimbraAutoDeclineSignatureChange}
									selection={zimbraPrefCalendarAutoDeclineSignatureId}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.auto_refuse', 'Auto-Refuse')}
									backgroundColor="gray6"
									value={zimbraPrefCalendarAutoDeclineSignatureId?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
						<Row width="30%">
							{isEditMode && (
								<Select
									items={signatureItems}
									background="gray5"
									label={t('label.auto_negation', 'Auto-Negation')}
									showCheckbox={false}
									onChange={onZimbraAutoDenySignatureChange}
									selection={zimbraPrefCalendarAutoDenySignatureId}
								/>
							)}
							{!isEditMode && (
								<Input
									label={t('label.auto_negation', 'Auto-Negation')}
									backgroundColor="gray6"
									value={zimbraPrefCalendarAutoDenySignatureId?.label}
									size="medium"
									readOnly
								/>
							)}
						</Row>
					</Container>
				</ListRow>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				{isEditMode && (
					<Row padding={{ top: 'extralarge' }} width="100%">
						<Textarea
							label={t('label.description', 'Description')}
							backgroundColor="gray5"
							value={description}
							size="medium"
							onChange={(e: any): any => {
								setDescription(e.target.value);
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
								{t('label.description', 'Description')}
							</Text>
						</Row>
						<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
							<Text size="small">{resourceDetailData?.description}</Text>
						</Row>
					</>
				)}
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
			{isOpenCreateEditSignatureDialog && (
				<Modal
					title={
						isEditSignature ? (
							<Trans
								i18nKey="label.edit_signature"
								defaults="<bold>Edit Signature</bod>"
								components={{ bold: <strong /> }}
							/>
						) : (
							<Trans
								i18nKey="label.new_signature"
								defaults="<bold>New Signature</bod>"
								components={{ bold: <strong /> }}
							/>
						)
					}
					open={isOpenCreateEditSignatureDialog}
					showCloseIcon
					onClose={(): void => {
						setIsOpenCreateEditSignatureDialog(false);
					}}
					size="medium"
					customFooter={
						<Container orientation="horizontal" mainAlignment="space-between">
							<Button label={t('label.help', 'Help')} type="outlined" color="primary" />
							<Container orientation="horizontal" mainAlignment="flex-end">
								<Padding all="small">
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={(): void => {
											setIsOpenCreateEditSignatureDialog(false);
										}}
									/>
								</Padding>
								<Button
									label={t('label.add_to_the_list', 'Add it to the list')}
									color="primary"
									disabled={signatureName === '' || signatureContent === ''}
									onClick={onSaveOrEditSignature}
								/>
							</Container>
						</Container>
					}
				>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge', bottom: 'extralarge' }}
					>
						<Container padding={{ bottom: 'medium' }}>
							<Input
								label={t('label.name_of_signature', 'Name of Signature')}
								value={signatureName}
								background="gray5"
								onChange={(e: any): any => {
									setSignatureName(e.target.value);
								}}
							/>
						</Container>
						<Container>
							<Textarea
								background="gray5"
								label={t('label.content', 'Content')}
								value={signatureContent}
								onChange={(e: any): any => {
									setSignatureContent(e.target.value);
								}}
							/>
						</Container>
					</Container>
				</Modal>
			)}
		</Container>
	);
};

export default ResourceEditDetailView;
