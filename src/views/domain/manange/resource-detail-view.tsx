/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../../list/list-row';
import { getCalenderResource } from '../../../services/get-cal-resource-service';
import { getSingatures } from '../../../services/get-signature-service';
import { useDomainStore } from '../../../store/domain/store';

const ResourceDetailContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 43px;
	right: 12px;
	bottom: 0px;
	left: ${'max(calc(100% - 680px), 12px)'};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
	opacity: '10%;
`;

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

const ResourceDetailView: FC<any> = ({ selectedResourceList, setShowResourceDetailView }) => {
	const [t] = useTranslation();
	const cosList = useDomainStore((state) => state.cosList);
	const [resourceInformation, setResourceInformation]: any = useState([]);
	const [resourceDetailData, setResourceDetailData]: any = useState({});
	const [sendInviteList, setSendInviteList] = useState<any[]>([]);
	const [signatureData, setSignatureData]: any = useState([]);
	const [zimbraCOSId, setZimbraCOSId] = useState<string>('');
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [signatureItems, setSignatureItems] = useState<any[]>([]);
	const [zimbraPrefCalendarAutoAcceptSignatureId, setZimbraPrefCalendarAutoAcceptSignatureId] =
		useState<string>('');
	const [zimbraPrefCalendarAutoDeclineSignatureId, setZimbraPrefCalendarAutoDeclineSignatureId] =
		useState<string>('');
	const [zimbraPrefCalendarAutoDenySignatureId, setZimbraPrefCalendarAutoDenySignatureId] =
		useState<string>('');

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
	const [signatureList, setSignatureList] = useState<any[]>([]);
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
					'Auto accept if available, auto decline on conflict'
				),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT
			},
			{
				label: t(
					'label.manual_accept_auto_decline_on_conflict',
					'Manual accept, auto decline on conflict'
				),
				value: SCHEDULE_POLITY_TYPE.MANUAL_ACCEPT
			},
			{
				label: t('label.auto_accept_always', 'Auto accept always'),
				value: SCHEDULE_POLITY_TYPE.AUTO_ACCEPT_ALWAYS
			},
			{
				label: t('label.no_auto_accept_or_decline', 'No auto accept or decline'),
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

	useEffect(() => {
		if (!!cosList && cosList.length > 0) {
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
		}
	}, [cosList, t]);

	useEffect(() => {
		if (!!signatureData && signatureData.length > 0) {
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
		}
	}, [signatureData, t]);

	const generateSendInviteList = (sendInviteTo: any): void => {
		if (sendInviteTo && Array.isArray(sendInviteTo)) {
			const sList: any[] = [];
			sendInviteTo.forEach((item: any, index: number) => {
				sList.push({
					id: index,
					columns: [
						<Text size="medium" weight="light" key={index} color="gray0">
							{item?._content}
						</Text>
					],
					item,
					clickable: false
				});
			});
			setSendInviteList(sList);
		}
	};

	const getResourceDetail = useCallback((): void => {
		getCalenderResource(selectedResourceList?.id)
			.then((response) => response.json())
			.then((data) => {
				const resourceDetailResponse =
					data?.Body?.GetCalendarResourceResponse?.calresource[0] || {};
				const obj: any = {};
				resourceDetailResponse?.a?.map((item: any) => {
					obj[item?.n] = item._content;
					return '';
				});
				const sendInviteTo = resourceDetailResponse?.a?.filter(
					(value: any) => value?.n === 'zimbraPrefCalendarForwardInvitesTo'
				);
				generateSendInviteList(sendInviteTo);
				setResourceDetailData(obj);
				setResourceInformation(resourceDetailResponse?.a);
			});
	}, [selectedResourceList?.id]);

	useEffect(() => {
		getResourceDetail();
	}, [getResourceDetail]);

	const generateSignatureList = (signatureResponse: any): void => {
		if (signatureResponse && Array.isArray(signatureResponse)) {
			const sList: any[] = [];
			signatureResponse.forEach((item: any, index: number) => {
				sList.push({
					id: item?.id,
					columns: [
						<Text size="medium" weight="light" key={item?.id} color="gray0">
							{item?.name}
						</Text>
					],
					item,
					clickable: false
				});
			});
			setSignatureList(sList);
		}
	};

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
		if (!!resourceInformation && resourceInformation.length > 0) {
			const obj: any = {};
			resourceInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});

			setZimbraCalResType(
				resourceTypeOptions.find((item: any) => item.value === obj.zimbraCalResType)
			);
			setZimbraAccountStatus(
				accountStatusOptions.find((item: any) => item.value === obj.zimbraAccountStatus)
			);
			setZimbraCalResAutoDeclineRecurring(
				autoRefuseOption.find((item: any) => item.value === obj.zimbraCalResAutoDeclineRecurring)
			);
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

	useEffect(() => {
		if (
			resourceDetailData?.zimbraCalResAutoAcceptDecline &&
			resourceDetailData?.zimbraCalResAutoDeclineIfBusy
		) {
			if (
				resourceDetailData?.zimbraCalResAutoAcceptDecline === 'TRUE' &&
				resourceDetailData?.zimbraCalResAutoDeclineIfBusy === 'TRUE'
			) {
				setSchedulePolicyType(schedulePolicyItems[0]);
			}
			if (
				resourceDetailData?.zimbraCalResAutoAcceptDecline === 'FALSE' &&
				resourceDetailData?.zimbraCalResAutoDeclineIfBusy === 'TRUE'
			) {
				setSchedulePolicyType(schedulePolicyItems[1]);
			}
			if (
				resourceDetailData?.zimbraCalResAutoAcceptDecline === 'TRUE' &&
				resourceDetailData?.zimbraCalResAutoDeclineIfBusy === 'FALSE'
			) {
				setSchedulePolicyType(schedulePolicyItems[2]);
			}
			if (
				resourceDetailData?.zimbraCalResAutoAcceptDecline === 'FALSE' &&
				resourceDetailData?.zimbraCalResAutoDeclineIfBusy === 'FALSE'
			) {
				setSchedulePolicyType(schedulePolicyItems[3]);
			}
		}
	}, [
		resourceDetailData.zimbraCalResAutoAcceptDecline,
		resourceDetailData.zimbraCalResAutoDeclineIfBusy,
		schedulePolicyItems
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

	return (
		<ResourceDetailContainer background="gray5" mainAlignment="flex-start">
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
						onClick={(): void => setShowResourceDetailView(false)}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>
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
								backgroundColor="gray6"
								value={resourceDetailData?.displayName}
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="EmailOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.email', 'Email')}
								backgroundColor="gray6"
								value={resourceDetailData?.mail}
								size="medium"
								readOnly
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
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CubeOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon
								icon="DashboardOutline"
								size="large"
								color={STATUS_COLOR[resourceDetailData?.zimbraAccountStatus]?.color}
							/>
						</Row>
						<Row width="85%">
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
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CosOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="HistoryOutline" size="large" color="gray0" />
						</Row>
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="ClockOutline" size="large" color="gray0" />
						</Row>
						<Row width="100%">
							<Select
								items={schedulePolicyItems}
								background="gray5"
								label={t('label.schedule_policy', 'Schedule Policy')}
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
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.maximum_conflict_allowed', 'Maximun Conflict Allowed')}
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraCalResMaxNumConflictsAllowed}
								size="medium"
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="FlashOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.percentage_maximum_conflict_allowed', '% Maximun Conflict Allowed')}
								readOnly
								backgroundColor="gray6"
								value={resourceDetailData?.zimbraCalResMaxPercentConflictsAllowed}
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
							/>
						</Row>
					</Container>
					<Container
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row padding={{ top: 'large', right: 'small' }}>
							<Icon icon="CalendarOutline" size="large" color="gray0" />
						</Row>
						<Row width="85%">
							<Input
								label={t('label.creation_date', 'Creation Date')}
								readOnly
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
						/>

						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.add', 'Add')}
								icon="Plus"
								color="primary"
								height="44px"
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
								value=""
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
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
							showCheckbox={false}
							style={{ overflow: 'auto', height: '100%' }}
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
							/>
						</Padding>
						<Padding left="large">
							<Button
								type="outlined"
								label={t('label.edit', 'Edit')}
								icon="Edit"
								color="secondary"
								height="44px"
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
								value=""
								size="medium"
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="secondary" />}
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
							rows={signatureList}
							headers={signatureHeaders}
							showCheckbox={false}
							style={{ overflow: 'auto', height: '100%' }}
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
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_accept', 'Auto-Accept')}
								showCheckbox={false}
								onChange={onZimbraAutoAcceptSignatureChange}
								selection={zimbraPrefCalendarAutoAcceptSignatureId}
							/>
						</Row>
						<Row width="30%">
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_refuse', 'Auto-Refuse')}
								showCheckbox={false}
								onChange={onZimbraAutoDeclineSignatureChange}
								selection={zimbraPrefCalendarAutoDeclineSignatureId}
							/>
						</Row>
						<Row width="30%">
							<Select
								items={signatureItems}
								background="gray5"
								label={t('label.auto_negation', 'Auto-Negation')}
								showCheckbox={false}
								onChange={onZimbraAutoDenySignatureChange}
								selection={zimbraPrefCalendarAutoDenySignatureId}
							/>
						</Row>
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
						{t('label.description', 'Description')}
					</Text>
				</Row>
				<Row padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}>
					<Text size="small">{resourceDetailData?.description}</Text>
				</Row>
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
			</Container>
		</ResourceDetailContainer>
	);
};

export default ResourceDetailView;
