/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

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
	Modal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import _ from 'lodash';
import moment from 'moment';
import { Trans, useTranslation } from 'react-i18next';

import { SendInviteAccounts } from './send-invite-accounts';
import { deleteCalendarResource } from '../../../../services/delete-cal-resource-service';
import { getCalenderResource } from '../../../../services/get-cal-resource-service';
import { getDelegateAuthRequest } from '../../../../services/get-delegate-auth-request';
import { modifyCalendarResource } from '../../../../services/modify-cal-resource-service';
import { renameCalendarResource } from '../../../../services/rename-cal-resource-service';
import { setPasswordRequest } from '../../../../services/set-password-service';
import { useDomainStore } from '../../../../store/domain/store';
import { useStickyBarStore } from '../../../../store/sticky-bar/store';
import Displayer from '../../../components/displayer';
import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';
import { RouteLeavingGuard } from '../../../ui-extras/nav-guard';

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
	setIsUpdateRecord
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const cosList = useDomainStore((state) => state.cosList);
	const [resourceInformation, setResourceInformation]: any = useState([]);
	const [resourceDetailData, setResourceDetailData]: any = useState({});
	const [sendInviteList, setSendInviteList] = useState<any[]>([]);
	const [sendInviteData, setSendInviteData]: any = useState([]);
	const [signatureData, setSignatureData]: any = useState([]);
	const [zimbraCOSId, setZimbraCOSId] = useState<any>('');
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [resourceName, setResourceName] = useState<string>('');
	const [resourceMail, setResourceMail] = useState<string>('');
	const [zimbraCalResMaxNumConflictsAllowed, setZimbraCalResMaxNumConflictsAllowed] =
		useState<string>('');
	const [zimbraCalResMaxPercentConflictsAllowed, setZimbraCalResMaxPercentConflictsAllowed] =
		useState<string>('');
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const { isSticky, setIsSticky } = useStickyBarStore();
	const errorMessage = useMemo(
		() => t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
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
				label: t('label.meeting_room', 'Meeting Room'),
				value: RESOURCE_TYPE.LOCATION
			},
			{
				label: t('label.equipment', 'Equipment'),
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
	const [defaultSchedulePolicyType, setDefaultSchedulePolicyType]: any = useState();
	const [schedulePolicyType, setSchedulePolicyType]: any = useState();

	const [password, setPassword]: any = useState('');
	const [repeatPassword, setRepeatPassword]: any = useState('');

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

	const generateSendInviteList = (sendInviteTo: any): void => {
		if (sendInviteTo && Array.isArray(sendInviteTo)) {
			setSendInviteList(sendInviteTo);
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

	useEffect(() => {
		getResourceDetail();
	}, [getResourceDetail]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
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
	}, [resourceInformation, resourceTypeOptions, accountStatusOptions, autoRefuseOption, cosItems]);

	const setSchedulePolicyItem = useCallback(
		(zimbraCalResAutoAcceptDecline: any, zimbraCalResAutoDeclineIfBusy: any): any => {
			if (zimbraCalResAutoAcceptDecline === 'TRUE' && zimbraCalResAutoDeclineIfBusy === 'TRUE') {
				setDefaultSchedulePolicyType(schedulePolicyItems[0]);
				setSchedulePolicyType(schedulePolicyItems[0]);
			}
			if (zimbraCalResAutoAcceptDecline === 'FALSE' && zimbraCalResAutoDeclineIfBusy === 'TRUE') {
				setDefaultSchedulePolicyType(schedulePolicyItems[1]);
				setSchedulePolicyType(schedulePolicyItems[1]);
			}
			if (zimbraCalResAutoAcceptDecline === 'TRUE' && zimbraCalResAutoDeclineIfBusy === 'FALSE') {
				setDefaultSchedulePolicyType(schedulePolicyItems[2]);
				setSchedulePolicyType(schedulePolicyItems[2]);
			}
			if (zimbraCalResAutoAcceptDecline === 'FALSE' && zimbraCalResAutoDeclineIfBusy === 'FALSE') {
				setDefaultSchedulePolicyType(schedulePolicyItems[3]);
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
			defaultSchedulePolicyType?.value !== undefined &&
			defaultSchedulePolicyType?.value !== schedulePolicyType?.value
		) {
			setIsDirty(true);
		}
	}, [defaultSchedulePolicyType, schedulePolicyType]);

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
		Promise.all(requests).then(() => {
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: t('label.changes_have_been_saved', 'The changes have been saved'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setIsDirty(false);
			setIsUpdateRecord(true);
		});
	};

	const createErrorSnackbar = useCallback(
		(label: string): void => {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	const validatePassword = (): boolean => {
		if (password !== '' && password?.length < 6) {
			createErrorSnackbar(
				t('label.password_length_msg', 'Password should be more than 5 characters')
			);
			return false;
		}
		if (password !== repeatPassword) {
			createErrorSnackbar(
				t('label.password_and_repeat_password_not_match', 'Passwords do not match')
			);
			return false;
		}
		return true;
	};

	const onSave = (): void => {
		if (!validatePassword()) return;
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
			_content:
				schedulePolicyType?.value === 1 || schedulePolicyType?.value === 3 ? 'TRUE' : 'FALSE'
		});
		attributes.push({
			n: 'zimbraCalResAutoDeclineIfBusy',
			_content:
				schedulePolicyType?.value === 1 || schedulePolicyType?.value === 2 ? 'TRUE' : 'FALSE'
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
				severity: 'success',
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
			.then(() => {
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
					severity: 'error',
					label: error.message ? error.message : errorMessage,

					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		selectedResourceList?.id,
		selectedResourceList?.name,
		onSuccess,
		t,
		createSnackbar,
		errorMessage
	]);

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
					severity: 'error',
					label: error?.message ? error?.message : errorMessage,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		selectedResourceList?.id,
		selectedResourceList?.name,
		onSuccess,
		t,
		createSnackbar,
		errorMessage
	]);

	const onViewMail = useCallback(() => {
		getDelegateAuthRequest(selectedResourceList?.id)
			.then((data: any) => {
				if (data?.authToken?.[0]) {
					window.open(
						`https://${window.location.hostname}/service/preauth?authtoken=${data?.authToken?.[0]._content}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
						'blank'
					);
				} else {
					createSnackbar({
						key: 'error',
						severity: 'error',
						// eslint-disable-next-line sonarjs/no-duplicate-string
						label: errorMessage,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message ? error?.message : errorMessage,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, errorMessage, selectedResourceList?.id]);

	const buttons = [
		{
			align: 'right',
			label: t('label.view_mail', 'VIEW MAIL'),
			color: 'primary',
			onClick: onViewMail
		},
		{
			align: 'right',
			type: 'outlined',
			color: 'error',
			onClick: onDeleteResource,
			label: t('label.delete', 'delete')
		},
		{
			align: 'left',
			icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
			onClick: (): void => {
				setIsSticky(!isSticky);
			}
		}
	];

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
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="large">
								<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
							</Padding>
							<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
						</Container>
					)}
				</Row>
				<Row padding={{ right: 'extrasmall', left: 'small' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => {
							setShowResourceEditDetailView(false);
						}}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>

			<Container
				padding={{ left: 'large', right: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100% - 64px)"
				background="white"
				style={{ overflow: 'auto' }}
			>
				<Displayer buttons={buttons} pinIcon={isSticky} />
				<Row>
					<Text size="small" weight="bold">
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
								backgroundColor="gray5"
								value={resourceName}
								onChange={(e: any): any => {
									setResourceName(e.target.value);
								}}
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
								backgroundColor="gray5"
								value={resourceMail}
								onChange={(e: any): any => {
									setResourceMail(e.target.value);
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
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.server', 'Server')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraMailHost}
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
							<Select
								items={resourceTypeOptions}
								background="gray5"
								label={t('label.type', 'Type')}
								showCheckbox={false}
								onChange={onResouseTypeChange}
								selection={zimbraCalResType}
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
							<Select
								items={accountStatusOptions}
								background="gray5"
								label={t('label.status', 'Status')}
								showCheckbox={false}
								onChange={onAccountStatusChange}
								selection={zimbraAccountStatus}
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
							<Select
								items={cosItems}
								background="gray5"
								label={t('label.class_of_service', 'Class of Service')}
								showCheckbox={false}
								onChange={onCosChange}
								selection={zimbraCOSId}
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
							<Select
								items={autoRefuseOption}
								background="gray5"
								label={t('label.auto_refuse', 'Auto-Refuse')}
								showCheckbox={false}
								onChange={onAutoRefuseChange}
								selection={zimbraCalResAutoDeclineRecurring}
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
							<Select
								items={schedulePolicyItems}
								background="gray5"
								label={t('label.schedule_policy', 'Set Policy')}
								showCheckbox={false}
								onChange={onSchedulePolicyChange}
								selection={schedulePolicyType}
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
								label={t('label.maximum_conflict_allowed', 'Maximum Conflict Allowed')}
								backgroundColor="gray5"
								value={zimbraCalResMaxNumConflictsAllowed}
								onChange={(e: any): any => {
									setZimbraCalResMaxNumConflictsAllowed(e.target.value);
								}}
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
								backgroundColor="gray5"
								value={zimbraCalResMaxPercentConflictsAllowed}
								onChange={(e: any): any => {
									setZimbraCalResMaxPercentConflictsAllowed(e.target.value);
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
						<Row width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('label.id_lbl', 'ID')}
								backgroundColor="gray6"
								value={selectedResourceList?.id}
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
							/>
						</Row>
					</Container>
				</ListRow>

				<>
					<Row width="100%" padding={{ top: 'medium' }}>
						<Divider color="gray3" />
					</Row>
					<Row padding={{ top: 'extralarge' }}>
						<Text size="small" weight="bold">
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

				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>
				<SendInviteAccounts
					isEditable
					sendInviteList={sendInviteList}
					setSendInviteList={setSendInviteList}
				/>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray3" />
				</Row>

				<Row padding={{ top: 'extralarge' }} width="100%">
					<Textarea
						label={t('label.description', 'Description')}
						backgroundColor="gray5"
						value={zimbraNotes}
						size="medium"
						onChange={(e: any): any => {
							setZimbraNotes(e.target.value);
						}}
					/>
				</Row>
			</Container>
			{isOpenDeleteDialog && (
				<Modal
					size="medium"
					title={t('label.deleting_resource_name', 'You are deleting {{name}}', {
						name: selectedResourceList?.name
					})}
					open={isOpenDeleteDialog}
					customFooter={
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Row style={{ gap: '1rem' }}>
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
