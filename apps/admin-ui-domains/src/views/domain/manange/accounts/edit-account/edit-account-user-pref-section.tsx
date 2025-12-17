/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipInput,Container, Divider, Row, Text } from '@zextras/carbonio-design-system';
import { map, some } from 'lodash-es';
import {
	ChangeEvent,
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState} from 'react';
import { useTranslation } from 'react-i18next';

import CustomChip from '../../../../components/customChip';
import InheritedInput from '../../../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../../../utility/inherited-components/inherited-select';
import InheritedSwitch from '../../../../utility/inherited-components/inherited-switch';
import {
	appointmentReminder,
	charactorSet,
	conversationGroupBy,
	isValidEmail,
	timeZoneList} from '../../../../utility/utils';
import { AccountContext } from '../account-context';
import { SignatureDetail } from './signature-detail';

const EditAccountUserPrefrencesSection: FC<{
	signatureItems: any;
	signatureList: any;
}> = ({ signatureItems, signatureList }) => {
	const context = useContext(AccountContext);
	const [t] = useTranslation();
	const {
		accountDetail,
		setAccountDetail,
		setSignatureItems,
		setSignatureList,
		cosDetail,
		accSpecificDetail
	} = context;
	const [outOfOfficeCacheDurationNum, setOutOfOfficeCacheDurationNum] = useState(
		accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1)
	);
	const [zimbraAllowFromAddress, setZimbraAllowFromAddress] = useState<any[]>([]);

	const timezones = useMemo(() => timeZoneList(t), [t]);
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const APPOINTMENT_REMINDER = useMemo(() => appointmentReminder(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);
	const outOfOfficeCacheDurationType = useMemo(
		() => accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) ?? '',
		[accountDetail]
	);
	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('account_details.manuallly', 'Manually'),
				value: '31536000'
			},
			{
				label: t('account_details.as_new_email_arrives', 'As new e-mail arrives'),
				value: '500'
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
			{ label: `15 ${t('label.minutes', 'minutes')}`, value: '15m' }
		],
		[t]
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

	const SEND_READ_RECEIPTS = useMemo(
		() => [
			{ label: t('label.never_send_read_receipt', 'Never send a read receipt'), value: 'never' },
			{ label: t('label.always_send_read_receipt', 'Always send a read receipt'), value: 'always' },
			{ label: t('label.ask_me', 'Ask me'), value: 'prompt' }
		],
		[t]
	);

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
					defaultValue_one: '{{count}} minute',
					defaultValue_other: '{{count}} minutes'
				}),
				value: '30m'
			},
			{
				label: t('reminder.minute', {
					count: 60,
					defaultValue_one: '{{count}} minute',
					defaultValue_other: '{{count}} minutes'
				}),
				value: '60m'
			},
			{
				label: t('reminder.minute', {
					count: 90,
					defaultValue_one: '{{count}} minute',
					defaultValue_other: '{{count}} minutes'
				}),
				value: '90m'
			},
			{
				label: t('reminder.minute', {
					count: 120,
					defaultValue_one: '{{count}} minute',
					defaultValue_other: '{{count}} minutes'
				}),
				value: '120m'
			}
		],
		[t]
	);

	const changeOutOfOfficeDurationetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
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
	const onReadReceiptChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefMailSendReadReceipts: v }));
	};

	const setEmptyValue = useCallback(
		(keyName: string) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
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
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefMessageViewHtmlPreferred}
						onChange={changeSwitchOption}
						label={t('account_details.view_mail_as_html', 'View mail as HTML')}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefMessageViewHtmlPreferred}
						fromSubValue={accSpecificDetail?.zimbraPrefMessageViewHtmlPreferred}
						inputName={'zimbraPrefMessageViewHtmlPreferred'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMessageViewHtmlPreferred')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.group_by', 'Group by')}
						items={GROUP_BY}
						subValue={accountDetail.zimbraPrefGroupMailBy}
						inheritedValue={cosDetail.zimbraPrefGroupMailBy}
						fromSubValue={accSpecificDetail?.zimbraPrefGroupMailBy}
						background="gray5"
						selectName="zimbraPrefGroupMailBy"
						onChange={onGroupByChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefGroupMailBy')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.default_charset', 'Default Charset')}
						items={CHARACTOR_SET}
						subValue={accountDetail.zimbraPrefMailDefaultCharset}
						inheritedValue={cosDetail.zimbraPrefMailDefaultCharset}
						fromSubValue={accSpecificDetail?.zimbraPrefMailDefaultCharset}
						background="gray5"
						selectName="zimbraPrefMailDefaultCharset"
						onChange={onCharactorSetChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailDefaultCharset')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefMessageIdDedupingEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.auto_delete_duplicate_messages',
							'Auto-Delete duplicate messages'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefMessageIdDedupingEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefMessageIdDedupingEnabled}
						inputName={'zimbraPrefMessageIdDedupingEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMessageIdDedupingEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefMailToasterEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.enable_new_mail_toast_notification',
							`Enable New Mail Toast Notification`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefMailToasterEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefMailToasterEnabled}
						inputName={'zimbraPrefMailToasterEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailToasterEnabled')}
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
					<InheritedSelect
						label={t('label.check_new_mail_every', 'Check new mail every')}
						items={POLLING_INTERVAL}
						subValue={accountDetail.zimbraPrefMailPollingInterval}
						inheritedValue={cosDetail.zimbraPrefMailPollingInterval}
						fromSubValue={accSpecificDetail?.zimbraPrefMailPollingInterval}
						background="gray5"
						selectName="zimbraPrefMailPollingInterval"
						onChange={onPollingIntervalChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailPollingInterval')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefOutOfOfficeReplyEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.can_send_auto_reply_messages',
							`Can send auto-reply messages`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefOutOfOfficeReplyEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeReplyEnabled}
						inputName={'zimbraPrefOutOfOfficeReplyEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeReplyEnabled')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedInput
						label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
						subValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
						inheritedValue={cosDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
						fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
						background="gray5"
						inputName="zimbraPrefOutOfOfficeCacheDuration"
						onChange={changeOutOfOfficeDurationetail}
						onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
						pref={{ type: 'number' }}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
						items={TIME_TYPES}
						subValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
						inheritedValue={cosDetail.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
						fromSubValue={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
						background="gray5"
						selectName="zimbraPrefOutOfOfficeCacheDuration"
						onChange={onOutOfOfficeCacheDurationTypeChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.read_receipt_settings', 'Read Receipt settings')}
						items={SEND_READ_RECEIPTS}
						subValue={accountDetail?.zimbraPrefMailSendReadReceipts}
						inheritedValue={cosDetail.zimbraPrefMailSendReadReceipts}
						fromSubValue={accSpecificDetail?.zimbraPrefMailSendReadReceipts}
						background="gray5"
						selectName="zimbraPrefMailSendReadReceipts"
						onChange={onReadReceiptChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailSendReadReceipts')}
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
				<Row width="100%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefSaveToSent}
						onChange={changeSwitchOption}
						label={t('account_details.save_to_sent', 'Save to sent')}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefSaveToSent}
						fromSubValue={accSpecificDetail?.zimbraPrefSaveToSent}
						inputName={'zimbraPrefSaveToSent'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefSaveToSent')}
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
								if (isValidEmail(contact.label ?? '')) data.push(contact);
							});
							setZimbraAllowFromAddress(data);
							setAccountDetail((prev: any) => ({
								...prev,
								zimbraAllowFromAddress: map(data, 'label').join(', ')
							}));
						}}
						defaultValue={[]}
						value={zimbraAllowFromAddress}
						hasError={some(zimbraAllowFromAddress || [], { error: true })}
						ChipComponent={CustomChip}
						maxChips={null}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="100%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraFeatureReadReceiptsEnabled}
						onChange={changeSwitchOption}
						label={t(
							'domain.accounts.editAccount.allowTheUserToAskForAReadReceipt',
							`Allow the user to ask for a read receipt`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraFeatureReadReceiptsEnabled}
						fromSubValue={accSpecificDetail?.zimbraFeatureReadReceiptsEnabled}
						inputName={'zimbraFeatureReadReceiptsEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraFeatureReadReceiptsEnabled')}
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
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefMailSignatureEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.mail_signature', 'Mail Signature')}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefMailSignatureEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefMailSignatureEnabled}
						inputName={'zimbraPrefMailSignatureEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailSignatureEnabled')}
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
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefAutoAddAddressEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.enable_auto_add_contacts', `Enable auto-add contacts`)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefAutoAddAddressEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefAutoAddAddressEnabled}
						inputName={'zimbraPrefAutoAddAddressEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefAutoAddAddressEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefGalAutoCompleteEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefGalAutoCompleteEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefGalAutoCompleteEnabled}
						inputName={'zimbraPrefGalAutoCompleteEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefGalAutoCompleteEnabled')}
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
					<InheritedSelect
						label={t('label.time_zone', 'Time Zone')}
						items={timezones}
						subValue={accountDetail?.zimbraPrefTimeZoneId}
						inheritedValue={cosDetail.zimbraPrefTimeZoneId}
						fromSubValue={accSpecificDetail?.zimbraPrefTimeZoneId}
						background="gray5"
						selectName="zimbraPrefTimeZoneId"
						onChange={onPrefTimeZoneChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefTimeZoneId')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t(
							'account_details.appointments_default_duration',
							'Appointment’s Default Duration'
						)}
						items={APPOINTMENT_DURATION}
						subValue={accountDetail?.zimbraPrefCalendarDefaultApptDuration}
						inheritedValue={cosDetail.zimbraPrefCalendarDefaultApptDuration}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarDefaultApptDuration}
						background="gray5"
						selectName="zimbraPrefCalendarDefaultApptDuration"
						onChange={onCalendarDefaultApptDurationChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarDefaultApptDuration')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.appointment_reminder_in_minutes', 'Appointment Reminder in minutes')}
						items={APPOINTMENT_REMINDER}
						subValue={accountDetail?.zimbraPrefCalendarApptReminderWarningTime}
						inheritedValue={cosDetail.zimbraPrefCalendarApptReminderWarningTime}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarApptReminderWarningTime}
						background="gray5"
						selectName="zimbraPrefCalendarApptReminderWarningTime"
						onChange={onReminderWarningTimeChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarApptReminderWarningTime')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.default_calendar_view', 'Default Calendar View')}
						items={DefaultViewOptions}
						subValue={accountDetail?.zimbraPrefCalendarInitialView}
						inheritedValue={cosDetail.zimbraPrefCalendarInitialView}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarInitialView}
						background="gray5"
						selectName="zimbraPrefCalendarInitialView"
						onChange={onCalendarInitialViewChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarInitialView')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.the_week_starts_on', 'The Week starts on')}
						items={FIRST_DAY_OF_WEEK}
						subValue={accountDetail?.zimbraPrefCalendarFirstDayOfWeek}
						inheritedValue={cosDetail.zimbraPrefCalendarFirstDayOfWeek}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarFirstDayOfWeek}
						background="gray5"
						selectName="zimbraPrefCalendarFirstDayOfWeek"
						onChange={onFirstDayOfWeekChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarFirstDayOfWeek')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					{accountDetail?.zimbraId ? (
						<InheritedSelect
							label={t('label.default_appointment_visibility', 'Default Appointment visibility')}
							items={APPOINTMENT_VISIBILITY}
							subValue={accountDetail?.zimbraPrefCalendarApptVisibility}
							inheritedValue={cosDetail.zimbraPrefCalendarApptVisibility}
							fromSubValue={accSpecificDetail?.zimbraPrefCalendarApptVisibility}
							background="gray5"
							selectName="zimbraPrefCalendarApptVisibility"
							onChange={onAppointmentVisibilityChange}
							onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarApptVisibility')}
						/>
					) : (
						<></>
					)}
				</Row>
			</Row>

			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarShowPastDueReminders}
						onChange={changeSwitchOption}
						label={t(
							'account_details.enable_past_due_reminders',
							'Enable reminders of appointments in the past'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarShowPastDueReminders}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarShowPastDueReminders}
						inputName={'zimbraPrefCalendarShowPastDueReminders'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarShowPastDueReminders')}
					/>
				</Row>

				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
						onChange={changeSwitchOption}
						label={t(
							'account_details.allow_sending_cancellation_mail',
							'Allow sending cancellation mail'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarAllowCancelEmailToSelf}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
						inputName={'zimbraPrefCalendarAllowCancelEmailToSelf'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowCancelEmailToSelf')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarAllowForwardedInvite}
						onChange={changeSwitchOption}
						label={t(
							'account_details.add_forwarded_invites_to_calendar',
							'Automatically add forwarded appointments to the calendar'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarAllowForwardedInvite}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowForwardedInvite}
						inputName={'zimbraPrefCalendarAllowForwardedInvite'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowForwardedInvite')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
						onChange={changeSwitchOption}
						label={t(
							'account_details.add_invites_with_publish_method',
							`Add invites with PUBLISH method`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarAllowPublishMethodInvite}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
						inputName={'zimbraPrefCalendarAllowPublishMethodInvite'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowPublishMethodInvite')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarAutoAddInvites}
						onChange={changeSwitchOption}
						label={t(
							'label.add_appointments_when_invited',
							'Automatically add appointments when the user is invited'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarAutoAddInvites}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarAutoAddInvites}
						inputName={'zimbraPrefCalendarAutoAddInvites'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAutoAddInvites')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
						onChange={changeSwitchOption}
						label={t(
							'account_details.auto_decline_if_inviter_is_blacklisted',
							`Auto-decline if the sender is blacklisted`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarSendInviteDeniedAutoReply}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
						inputName={'zimbraPrefCalendarSendInviteDeniedAutoReply'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarSendInviteDeniedAutoReply')}
					/>
				</Row>
			</Row>
			<Row
				width="100%"
				padding={{ top: 'large', left: 'large', bottom: 'large' }}
				mainAlignment="space-between"
			>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
						onChange={changeSwitchOption}
						label={t(
							'account_details.notify_changes_by_delegated_access',
							`Notify changes made by delegated accounts`
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefCalendarNotifyDelegatedChanges}
						fromSubValue={accSpecificDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
						inputName={'zimbraPrefCalendarNotifyDelegatedChanges'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarNotifyDelegatedChanges')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						subValue={accountDetail?.zimbraPrefAppleIcalDelegationEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.use_ical_delegation_model_for_shared_calendars',
							'Use iCal delegation model for shared calendars'
						)}
						iconColor="primary"
						inheritedValue={cosDetail.zimbraPrefAppleIcalDelegationEnabled}
						fromSubValue={accSpecificDetail?.zimbraPrefAppleIcalDelegationEnabled}
						inputName={'zimbraPrefAppleIcalDelegationEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefAppleIcalDelegationEnabled')}
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountUserPrefrencesSection;
