/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useContext, useState, useEffect } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Switch,
	Divider,
	ChipInput
} from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../account-context';
import { SignatureDetail } from './signature-detail';
import {
	timeZoneList,
	conversationGroupBy,
	appointmentReminder,
	charactorSet
} from '../../../../utility/utils';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const EditAccountUserPrefrencesSection: FC<{ signatureItems: any; signatureList: any }> = ({
	signatureItems,
	signatureList
}) => {
	const conext = useContext(AccountContext);
	const [t] = useTranslation();
	const { accountDetail, setAccountDetail, setSignatureItems, setSignatureList } = conext;
	const [zimbraPrefMailPollingIntervalNum, setZimbraPrefMailPollingIntervalNum] = useState(
		accountDetail?.zimbraPrefMailPollingInterval?.slice(0, -1)
	);
	const [prefMailPollingIntervalType, setPrefMailPollingIntervalType] = useState(
		accountDetail?.zimbraPrefMailPollingInterval?.slice(-1) || ''
	);
	const [outOfOfficeCacheDurationNum, setOutOfOfficeCacheDurationNum] = useState(
		accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1)
	);
	const [outOfOfficeCacheDurationType, setOutOfOfficeCacheDurationType] = useState(
		accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''
	);
	const [prefReadReceiptsToAddress, setPrefReadReceiptsToAddress] = useState<any[]>([]);
	const [zimbraAllowFromAddress, setZimbraAllowFromAddress] = useState<any[]>([]);

	const timezones = useMemo(() => timeZoneList(t), [t]);
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const APPOINTMENT_REMINDER = useMemo(() => appointmentReminder(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);

	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('account_details.as_new_mail_arrives', 'As New Mail Arrives'),
				value: '',
				disabled: true
			},
			{ label: `2 ${t('label.minutes', 'minutes')}`, value: '2m' },
			{ label: `3 ${t('label.minutes', 'minutes')}`, value: '3m' },
			{ label: `4 ${t('label.minutes', 'minutes')}`, value: '4m' },
			{ label: `5 ${t('label.minutes', 'minutes')}`, value: '5m' },
			{ label: `6 ${t('label.minutes', 'minutes')}`, value: '6m' },
			{ label: `7 ${t('label.minutes', 'minutes')}`, value: '7m' },
			{ label: `8 ${t('label.minutes', 'minutes')}`, value: '8m' },
			{ label: `9 ${t('label.minutes', 'minutes')}`, value: '9m' },
			{ label: `10 ${t('label.minutes', 'minutes')}`, value: '10m' },
			{ label: `15 ${t('label.minutes', 'minutes')}`, value: '15m' },
			{
				label: t('account_details.manuallly', 'Manually'),
				value: accountDetail.zimbraPrefMailPollingInterval
			}
		],
		[accountDetail.zimbraPrefMailPollingInterval, t]
	);
	const TIME_TYPES = useMemo(
		() => [
			{ label: `${t('label.days', 'Days')}`, value: 'd' },
			{ label: `${t('label.hours', 'Hours')}`, value: 'h' },
			{ label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
			{ label: `${t('label.seconds', 'Seconds')}`, value: 's' }
		],
		[t]
	);
	const DefaultViewOptions = useMemo(
		() => [
			{ label: t('account_details.default_view.month', 'Month View'), value: 'month' },
			{ label: t('account_details.default_view.week', 'Week View'), value: 'week' },
			{ label: t('account_details.default_view.day', 'Day View'), value: 'day' },
			{ label: t('account_details.default_view.work_week', 'Work Week View'), value: 'workWeek' },
			{ label: t('account_details.default_view.list', 'List View'), value: 'list' }
		],
		[t]
	);
	const APPOINTMENT_VISIBILITY = useMemo(
		() => [
			{ label: t('label.public', 'Public'), value: 'public' },
			{ label: t('label.private', 'Private'), value: 'private' }
		],
		[t]
	);
	const FIRST_DAY_OF_WEEK = useMemo(
		() => [
			{ label: t('label.week_day.sunday', 'Sunday'), value: '0' },
			{ label: t('label.week_day.monday', 'Monday'), value: '1' },
			{ label: t('label.week_day.tuesday', 'Tuesday'), value: '2' },
			{ label: t('label.week_day.wednesday', 'Wednesday'), value: '3' },
			{ label: t('label.week_day.thursday', 'Thursday'), value: '4' },
			{ label: t('label.week_day.friday', 'Friday'), value: '5' },
			{ label: t('label.week_day.saturday', 'Saturday'), value: '6' }
		],
		[t]
	);
	useEffect(() => {
		setPrefReadReceiptsToAddress(
			accountDetail?.zimbraPrefReadReceiptsToAddress
				? accountDetail.zimbraPrefReadReceiptsToAddress
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraPrefReadReceiptsToAddress]);

	useEffect(() => {
		setZimbraAllowFromAddress(
			accountDetail?.zimbraAllowFromAddress
				? accountDetail.zimbraAllowFromAddress.split(', ').map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraAllowFromAddress]);

	const APPOINTMENT_DURATION = useMemo(
		() => [
			{
				label: t('reminder.minute', {
					count: 30,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				value: '30m'
			},
			{
				label: t('reminder.minute', {
					count: 60,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				value: '60m'
			},
			{
				label: t('reminder.minute', {
					count: 90,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				value: '90m'
			},
			{
				label: t('reminder.minute', {
					count: 120,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				value: '120m'
			}
		],
		[t]
	);

	const onPrefMailPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPrefMailPollingInterval: `${zimbraPrefMailPollingIntervalNum}${v}`
			}));
		},
		[zimbraPrefMailPollingIntervalNum, setAccountDetail]
	);
	const onPrefMailPollingIntervalNumChange = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPrefMailPollingInterval: `${e.target.value}${prefMailPollingIntervalType}`
			}));
			setZimbraPrefMailPollingIntervalNum(e.target.value);
		},
		[setAccountDetail, prefMailPollingIntervalType]
	);
	const changeAccDetail = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);
	const changeOutOfOfficeDurationetail = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPrefOutOfOfficeCacheDuration: `${e.target.value}${outOfOfficeCacheDurationType}`
			}));
			setOutOfOfficeCacheDurationNum(e.target.value);
		},
		[setAccountDetail, outOfOfficeCacheDurationType]
	);
	const onOutOfOfficeCacheDurationTypeChange = useCallback(
		(v: string) => {
			setAccountDetail((prev: any) => ({
				...prev,
				zimbraPrefOutOfOfficeCacheDuration: `${outOfOfficeCacheDurationNum}${v}`
			}));
		},
		[outOfOfficeCacheDurationNum, setAccountDetail]
	);
	const onPrefTimeZoneChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefTimeZoneId: v }));
	};
	const onCalendarDefaultApptDurationChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefCalendarDefaultApptDuration: v }));
	};
	const onReminderWarningTimeChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefCalendarApptReminderWarningTime: v }));
	};
	const onCalendarInitialViewChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefCalendarInitialView: v }));
	};
	const onFirstDayOfWeekChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefCalendarFirstDayOfWeek: v }));
	};
	const onAppointmentVisibilityChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefCalendarApptVisibility: v }));
	};
	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);

	const onGroupByChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefGroupMailBy: v }));
	};
	const onCharactorSetChange = (v: string): void => {
		v && setAccountDetail((prev: any) => ({ ...prev, zimbraPrefMailDefaultCharset: v }));
	};
	const onPollingIntervalChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefMailPollingInterval: v }));
	};

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMessageViewHtmlPreferred === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMessageViewHtmlPreferred')}
						label={t('account_details.view_mail_as_html', 'View mail as HTML')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Select
						background="gray5"
						label={t('label.group_by', 'Group by')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={GROUP_BY.find(
							(item: any) => item.value === accountDetail?.zimbraPrefGroupMailBy
						)}
						onChange={onGroupByChange}
						items={GROUP_BY}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Select
						background="gray5"
						label={t('label.default_charset', 'Default Charset')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={CHARACTOR_SET.find(
							(item: any) => item.value === accountDetail?.zimbraPrefMailDefaultCharset
						)}
						onChange={onCharactorSetChange}
						items={CHARACTOR_SET}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMessageIdDedupingEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMessageIdDedupingEnabled')}
						label={t(
							'account_details.auto_delete_duplicate_messages',
							'Auto-Delete duplicate messages'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailToasterEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailToasterEnabled')}
						label={t('account_details.enable_toast_for_new_emails', `Enable toast for new emails`)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.receiving_mails', 'Receiving Mails')}
					</Text>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Select
						items={POLLING_INTERVAL}
						background="gray5"
						label={t('label.check_new_mail_every', 'Check new mail every')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={POLLING_INTERVAL.find(
							(item: any) => item.value === accountDetail?.zimbraPrefMailPollingInterval
						)}
						onChange={onPollingIntervalChange}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="32%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
						label={t('account_details.cannot_check_for_less_than', `Cannot check for less than`)}
					/>
				</Row>
				<Row width="32%" mainAlignment="flex-start">
					<Input
						onChange={onPrefMailPollingIntervalNumChange}
						inputName="zimbraPrefMailPollingInterval"
						label={t(
							'account_details.min_new_check_interval_value',
							'Min new check interval (value)'
						)}
						backgroundColor="gray5"
						defaultValue={zimbraPrefMailPollingIntervalNum}
						value={zimbraPrefMailPollingIntervalNum}
						type="number"
					/>
				</Row>
				<Row width="32%" mainAlignment="flex-start">
					<Select
						items={TIME_TYPES}
						background="gray5"
						label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={TIME_TYPES.find(
							(item: any) => item.value === prefMailPollingIntervalType
						)}
						onChange={onPrefMailPollingIntervalTypeChange}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefNewMailNotificationEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefNewMailNotificationEnabled')}
						label={t(
							'account_details.enable_address_for_new_email_notifications',
							`Enable address for new email notifications`
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Input
						onChange={changeAccDetail}
						inputName="zimbraPrefNewMailNotificationAddress"
						label={t('label.enabed_address', 'Enabed Address')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.zimbraPrefNewMailNotificationAddress || ''}
						value={accountDetail?.zimbraPrefNewMailNotificationAddress || ''}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefOutOfOfficeReplyEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefOutOfOfficeReplyEnabled')}
						label={t(
							'account_details.can_send_auto_reply_messages',
							`Can send auto-reply messages`
						)}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Input
						label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
						backgroundColor="gray5"
						defaultValue={outOfOfficeCacheDurationNum}
						onChange={changeOutOfOfficeDurationetail}
						inputName="zimbraPrefOutOfOfficeCacheDuration"
						name="zimbraPrefOutOfOfficeCacheDuration"
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={TIME_TYPES}
						background="gray5"
						label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={TIME_TYPES.find(
							(item: any) =>
								item.value === accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1)
						)}
						onChange={onOutOfOfficeCacheDurationTypeChange}
					/>
				</Row>
			</Row>
			{/* <Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<Input
						label={t('label.out_of_office_message', 'Out of office message')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.zimbraPrefOutOfOfficeReply}
						value={accountDetail?.zimbraPrefOutOfOfficeReply}
						// onChange={changeAccDetail}
						inputName="zimbraPrefOutOfOfficeReply"
						name="zimbraPrefOutOfOfficeReply"
					/>
				</Row>
			</Row> */}
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
						label={t('account_details.send_read_receipts', `Send read receipts`)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{/* <Input
						onChange={changeAccDetail}
						inputName="zimbraPrefReadReceiptsToAddress"
						label={t('label.reply_to_address_for_receipt', 'Reply-to address for receipt')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.zimbraPrefReadReceiptsToAddress || ''}
						value={accountDetail?.zimbraPrefReadReceiptsToAddress || ''}
					/> */}
					<ChipInput
						placeholder={t(
							'account_details.this_account_is_a_in_direct_member_of',
							'This account is an indirect member of'
						)}
						background="gray5"
						onChange={(contacts: any): void => {
							const data: any = [];
							map(contacts, (contact) => {
								if (emailRegex.test(contact.label ?? '')) data.push(contact);
							});
							setPrefReadReceiptsToAddress(data);
							setAccountDetail((prev: any) => ({
								...prev,
								zimbraPrefReadReceiptsToAddress: map(data, 'label').join(', ')
							}));
						}}
						defaultValue={prefReadReceiptsToAddress}
						value={prefReadReceiptsToAddress}
						hasError={some(prefReadReceiptsToAddress || [], { error: true })}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.sending_mails', 'Sending Mails')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefSaveToSent === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefSaveToSent')}
						label={t('account_details.save_to_sent', 'Save to sent')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraAllowAnyFromAddress === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
						label={t(
							'account_details.allow_sending_from_any_address',
							`Allow sending from any address`
						)}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<ChipInput
						placeholder={t('label.allowed_sending_addresses', 'Allowed sending Addresses')}
						background="gray5"
						onChange={(contacts: any): void => {
							const data: any = [];
							map(contacts, (contact) => {
								if (emailRegex.test(contact.label ?? '')) data.push(contact);
							});
							setZimbraAllowFromAddress(data);
							setAccountDetail((prev: any) => ({
								...prev,
								zimbraAllowFromAddress: map(data, 'label').join(', ')
							}));
						}}
						defaultValue={zimbraAllowFromAddress}
						value={zimbraAllowFromAddress}
						hasError={some(zimbraAllowFromAddress || [], { error: true })}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.composing_mails', 'Composing Mails')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefMailSignatureEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMailSignatureEnabled')}
						label={t('account_details.mail_signature', 'Mail Signature')}
					/>
				</Row>
			</Row>
			<SignatureDetail
				isEditable
				signatureList={signatureList}
				setSignatureList={setSignatureList}
				signatureItems={signatureItems}
				setSignatureItems={setSignatureItems}
				accountId={accountDetail?.zimbraId}
			/>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.contact_options', 'Contact Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefAutoAddAddressEnabled')}
						label={t('account_details.enable_auto_add_contacts', `Enable auto-add contacts`)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
						label={t('account_details.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.calendar_options', 'Calendar Options')}
					</Text>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={timezones}
						background="gray5"
						label={t('label.time_zone', 'Time Zone')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={timezones.find(
							(item: any) => item.value === accountDetail?.zimbraPrefTimeZoneId
						)}
						onChange={onPrefTimeZoneChange}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={APPOINTMENT_DURATION}
						background="gray5"
						label={t(
							'account_details.appointments_default_duration',
							'Appointment’s Default Duration'
						)}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={APPOINTMENT_DURATION.find(
							(item: any) => item.value === accountDetail?.zimbraPrefCalendarDefaultApptDuration
						)}
						onChange={onCalendarDefaultApptDurationChange}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={APPOINTMENT_REMINDER}
						background="gray5"
						label={t('label.appointment_reminder_in_minutes', 'Appointment Reminder in minutes')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={APPOINTMENT_REMINDER.find(
							(item: any) => item.value === accountDetail?.zimbraPrefCalendarApptReminderWarningTime
						)}
						onChange={onReminderWarningTimeChange}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={DefaultViewOptions}
						background="gray5"
						label={t('label.default_calendar_view', 'Default Calendar View')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={DefaultViewOptions.find(
							(item: any) => item.value === accountDetail?.zimbraPrefCalendarInitialView
						)}
						onChange={onCalendarInitialViewChange}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Select
						items={FIRST_DAY_OF_WEEK}
						background="gray5"
						label={t('label.the_week_starts_on', 'The Week starts on')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={FIRST_DAY_OF_WEEK.find(
							(item: any) => item.value === accountDetail?.zimbraPrefCalendarFirstDayOfWeek
						)}
						onChange={onFirstDayOfWeekChange}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<Select
							items={APPOINTMENT_VISIBILITY}
							background="gray5"
							label={t('label.default_appointment_visibility', 'Default Appointment visibility')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={APPOINTMENT_VISIBILITY.find(
								(item: any) => item.value === accountDetail?.zimbraPrefCalendarApptVisibility
							)}
							onChange={onAppointmentVisibilityChange}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>

			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarShowPastDueReminders')}
						label={t(
							'account_details.enable_past_due_reminders',
							'Enable reminders of appointments in the past'
						)}
					/>
				</Row>
				{/* <Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarToasterEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarToasterEnabled')}
						label={t('account_details.enable_notifications', `Enable notifications`)}
					/>
				</Row> */}
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowCancelEmailToSelf')}
						label={t(
							'account_details.allow_sending_cancellation_mail',
							'Allow sending cancellation mail'
						)}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowForwardedInvite === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowForwardedInvite')}
						label={t(
							'account_details.add_forwarded_invites_to_calendar',
							'Automatically add forwarded appointments to the calendar'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAllowPublishMethodInvite === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAllowPublishMethodInvite')}
						label={t(
							'account_details.add_invites_with_publish_method',
							`Add invites with PUBLISH method`
						)}
					/>
				</Row>
			</Row>
			{/* <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarReminderFlashTitle === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarReminderFlashTitle')}
						label={t(
							'account_details.browser_title_for_appointments',
							`Browser title for appointments`
						)}
					/>
				</Row>
			</Row> */}
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				{/* <Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarReminderSoundsEnabled')}
						label={t(
							'account_details.audible_reminder_notification',
							'Audible reminder notification'
						)}
					/>
				</Row> */}
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAutoAddInvites')}
						label={t(
							'account_details.add_appointments_when_invited',
							'Automatically add appointments when the user is invited'
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarSendInviteDeniedAutoReply')}
						label={t(
							'account_details.auto_decline_if_inviter_is_blacklisted',
							`Auto-decline if the sender is blacklisted`
						)}
					/>
				</Row>
			</Row>
			{/* <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
			</Row> */}
			{/* <Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarAlwaysShowMiniCal === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarAlwaysShowMiniCal')}
						label={t('account_details.always_show_mini_calendar', 'Always show mini calendar')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarUseQuickAdd === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarUseQuickAdd')}
						label={t(
							'account_details.use_quickadd_dialog_in_creation',
							`Use QuickAdd dialog in creation`
						)}
					/>
				</Row>
			</Row> */}
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefCalendarNotifyDelegatedChanges === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefCalendarNotifyDelegatedChanges')}
						label={t(
							'account_details.notify_changes_by_delegated_access',
							`Notify changes made by delegated accounts`
						)}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefAppleIcalDelegationEnabled')}
						label={t(
							'account_details.use_ical_delegation_model_for_shared_calendars',
							'Use iCal delegation model for shared calendars'
						)}
					/>
				</Row>
				{/* <Row width="48%" mainAlignment="flex-start">
					<Switch
						value={accountDetail?.zimbraPrefUseTimeZoneListInCalendar === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefUseTimeZoneListInCalendar')}
						label={t(
							'account_details.show_time_zone_lists_in_view',
							'Show time zone lists in view'
						)}
					/>
				</Row> */}
			</Row>
		</Container>
	);
};

export default EditAccountUserPrefrencesSection;
