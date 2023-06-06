/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useContext, useState, useEffect } from 'react';
import { Container, Row, Text, Divider, ChipInput } from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../account-context';
import { SignatureDetail } from './signature-detail';
import {
	timeZoneList,
	conversationGroupBy,
	appointmentReminder,
	charactorSet,
	isValidEmail
} from '../../../../utility/utils';
import InheritedSwitch from './inherited-components/inherited-switch';
import InheritedSelect from './inherited-components/inherited-select';
import InheritedInput from './inherited-components/inherited-input';

const EditAccountUserPrefrencesSection: FC<{ signatureItems: any; signatureList: any }> = ({
	signatureItems,
	signatureList
}) => {
	const conext = useContext(AccountContext);
	const [t] = useTranslation();
	const {
		accountDetail,
		setAccountDetail,
		setSignatureItems,
		setSignatureList,
		cosDetail,
		accSpecificDetail
	} = conext;
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
	const setEmptyValue = useCallback(
		(keyName) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: '' }));
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
						accountValue={accountDetail?.zimbraPrefMessageViewHtmlPreferred}
						onChange={changeSwitchOption}
						label={t('account_details.view_mail_as_html', 'View mail as HTML')}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefMessageViewHtmlPreferred}
						fromAccount={accSpecificDetail?.zimbraPrefMessageViewHtmlPreferred}
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
						accountValue={accountDetail.zimbraPrefGroupMailBy}
						cosValue={cosDetail.zimbraPrefGroupMailBy}
						fromAccount={accSpecificDetail?.zimbraPrefGroupMailBy}
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
						accountValue={accountDetail.zimbraPrefMailDefaultCharset}
						cosValue={cosDetail.zimbraPrefMailDefaultCharset}
						fromAccount={accSpecificDetail?.zimbraPrefMailDefaultCharset}
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
						accountValue={accountDetail?.zimbraPrefMessageIdDedupingEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.auto_delete_duplicate_messages',
							'Auto-Delete duplicate messages'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefMessageIdDedupingEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefMessageIdDedupingEnabled}
						inputName={'zimbraPrefMessageIdDedupingEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMessageIdDedupingEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefMailToasterEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.enable_toast_for_new_emails', `Enable toast for new emails`)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefMailToasterEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefMailToasterEnabled}
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
						accountValue={accountDetail.zimbraPrefMailPollingInterval}
						cosValue={cosDetail.zimbraPrefMailPollingInterval}
						fromAccount={accSpecificDetail?.zimbraPrefMailPollingInterval}
						background="gray5"
						selectName="zimbraPrefMailPollingInterval"
						onChange={onPollingIntervalChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailPollingInterval')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="32%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefMailLocalDeliveryDisabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.allow_user_check_minimum_interval',
							'Allow the user to change the minimum checking interval'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefMailLocalDeliveryDisabled}
						fromAccount={accSpecificDetail?.zimbraPrefMailLocalDeliveryDisabled}
						inputName={'zimbraPrefMailLocalDeliveryDisabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailLocalDeliveryDisabled')}
					/>
				</Row>
				<Row width="32%" mainAlignment="flex-start">
					<InheritedInput
						label={t(
							'account_details.min_new_check_interval_value',
							'Min new check interval (value)'
						)}
						accountValue={accountDetail.zimbraPrefMailPollingInterval?.slice(0, -1) || 0}
						cosValue={cosDetail.zimbraPrefMailPollingInterval?.slice(0, -1) || 0}
						fromAccount={accSpecificDetail?.zimbraPrefMailPollingInterval}
						background="gray5"
						inputName="zimbraPrefMailPollingInterval"
						onChange={onPrefMailPollingIntervalNumChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailPollingInterval')}
						disabled={accountDetail?.zimbraPrefMailLocalDeliveryDisabled !== 'TRUE'}
						pref={{ type: 'number' }}
					/>
				</Row>
				<Row width="32%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
						items={TIME_TYPES}
						accountValue={accountDetail?.zimbraPrefMailPollingInterval?.slice(-1) || ''}
						cosValue={cosDetail.zimbraPrefMailPollingInterval?.slice(-1) || ''}
						fromAccount={accSpecificDetail?.zimbraPrefMailPollingInterval}
						background="gray5"
						selectName="zimbraPrefMailPollingInterval"
						onChange={onPollingIntervalChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefMailPollingInterval')}
						disabled={accountDetail?.zimbraPrefMailLocalDeliveryDisabled !== 'TRUE'}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefNewMailNotificationEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.enable_address_for_new_email_notifications',
							`Enable address for new email notifications`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefNewMailNotificationEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefNewMailNotificationEnabled}
						inputName={'zimbraPrefNewMailNotificationEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefNewMailNotificationEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedInput
						label={t('label.enabed_address', 'Enabed Address')}
						accountValue={accountDetail.zimbraPrefNewMailNotificationAddress || ''}
						cosValue={cosDetail.zimbraPrefNewMailNotificationAddress || ''}
						fromAccount={accSpecificDetail?.zimbraPrefNewMailNotificationAddress}
						background="gray5"
						inputName="zimbraPrefNewMailNotificationAddress"
						onChange={changeAccDetail}
						onChangeReset={(): void => setEmptyValue('zimbraPrefNewMailNotificationAddress')}
						disabled={accountDetail?.zimbraPrefNewMailNotificationEnabled !== 'TRUE'}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefOutOfOfficeReplyEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.can_send_auto_reply_messages',
							`Can send auto-reply messages`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefOutOfOfficeReplyEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefOutOfOfficeReplyEnabled}
						inputName={'zimbraPrefOutOfOfficeReplyEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeReplyEnabled')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedInput
						label={t('label.out_of_office_cache_lifetime', 'Out of office cache lifetime')}
						accountValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
						cosValue={cosDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(0, -1) || ''}
						fromAccount={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
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
						accountValue={accountDetail?.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
						cosValue={cosDetail.zimbraPrefOutOfOfficeCacheDuration?.slice(-1) || ''}
						fromAccount={accSpecificDetail?.zimbraPrefOutOfOfficeCacheDuration}
						background="gray5"
						selectName="zimbraPrefOutOfOfficeCacheDuration"
						onChange={onOutOfOfficeCacheDurationTypeChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefOutOfOfficeCacheDuration')}
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraFeatureReadReceiptsEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.send_read_receipts', `Send read receipts`)}
						iconColor="primary"
						cosValue={cosDetail.zimbraFeatureReadReceiptsEnabled}
						fromAccount={accSpecificDetail?.zimbraFeatureReadReceiptsEnabled}
						inputName={'zimbraFeatureReadReceiptsEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraFeatureReadReceiptsEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<ChipInput
						disabled={accountDetail?.zimbraFeatureReadReceiptsEnabled !== 'TRUE'}
						placeholder={t(
							'account_details.this_account_is_a_in_direct_member_of',
							'This account is an indirect member of'
						)}
						background="gray5"
						onChange={(contacts: any): void => {
							const data: any = [];
							map(contacts, (contact) => {
								if (isValidEmail(contact.label ?? '')) data.push(contact);
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
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefSaveToSent}
						onChange={changeSwitchOption}
						label={t('account_details.save_to_sent', 'Save to sent')}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefSaveToSent}
						fromAccount={accSpecificDetail?.zimbraPrefSaveToSent}
						inputName={'zimbraPrefSaveToSent'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefSaveToSent')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraAllowAnyFromAddress}
						onChange={changeSwitchOption}
						label={t(
							'account_details.allow_sending_from_any_address',
							`Allow sending from any address`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraAllowAnyFromAddress}
						fromAccount={accSpecificDetail?.zimbraAllowAnyFromAddress}
						inputName={'zimbraAllowAnyFromAddress'}
						onChangeReset={(): void => setEmptyValue('zimbraAllowAnyFromAddress')}
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
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefMailSignatureEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.mail_signature', 'Mail Signature')}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefMailSignatureEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefMailSignatureEnabled}
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
						accountValue={accountDetail?.zimbraPrefAutoAddAddressEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.enable_auto_add_contacts', `Enable auto-add contacts`)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefAutoAddAddressEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefAutoAddAddressEnabled}
						inputName={'zimbraPrefAutoAddAddressEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefAutoAddAddressEnabled')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefGalAutoCompleteEnabled}
						onChange={changeSwitchOption}
						label={t('account_details.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefGalAutoCompleteEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefGalAutoCompleteEnabled}
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
						accountValue={accountDetail?.zimbraPrefTimeZoneId}
						cosValue={cosDetail.zimbraPrefTimeZoneId}
						fromAccount={accSpecificDetail?.zimbraPrefTimeZoneId}
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
						accountValue={accountDetail?.zimbraPrefCalendarDefaultApptDuration}
						cosValue={cosDetail.zimbraPrefCalendarDefaultApptDuration}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarDefaultApptDuration}
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
						accountValue={accountDetail?.zimbraPrefCalendarApptReminderWarningTime}
						cosValue={cosDetail.zimbraPrefCalendarApptReminderWarningTime}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarApptReminderWarningTime}
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
						accountValue={accountDetail?.zimbraPrefCalendarInitialView}
						cosValue={cosDetail.zimbraPrefCalendarInitialView}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarInitialView}
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
						accountValue={accountDetail?.zimbraPrefCalendarFirstDayOfWeek}
						cosValue={cosDetail.zimbraPrefCalendarFirstDayOfWeek}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarFirstDayOfWeek}
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
							accountValue={accountDetail?.zimbraPrefCalendarApptVisibility}
							cosValue={cosDetail.zimbraPrefCalendarApptVisibility}
							fromAccount={accSpecificDetail?.zimbraPrefCalendarApptVisibility}
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
						accountValue={accountDetail?.zimbraPrefCalendarShowPastDueReminders}
						onChange={changeSwitchOption}
						label={t(
							'account_details.enable_past_due_reminders',
							'Enable reminders of appointments in the past'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarShowPastDueReminders}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarShowPastDueReminders}
						inputName={'zimbraPrefCalendarShowPastDueReminders'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarShowPastDueReminders')}
					/>
				</Row>

				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
						onChange={changeSwitchOption}
						label={t(
							'account_details.allow_sending_cancellation_mail',
							'Allow sending cancellation mail'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarAllowCancelEmailToSelf}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarAllowCancelEmailToSelf}
						inputName={'zimbraPrefCalendarAllowCancelEmailToSelf'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowCancelEmailToSelf')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefCalendarAllowForwardedInvite}
						onChange={changeSwitchOption}
						label={t(
							'account_details.add_forwarded_invites_to_calendar',
							'Automatically add forwarded appointments to the calendar'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarAllowForwardedInvite}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarAllowForwardedInvite}
						inputName={'zimbraPrefCalendarAllowForwardedInvite'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowForwardedInvite')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
						onChange={changeSwitchOption}
						label={t(
							'account_details.add_invites_with_publish_method',
							`Add invites with PUBLISH method`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarAllowPublishMethodInvite}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarAllowPublishMethodInvite}
						inputName={'zimbraPrefCalendarAllowPublishMethodInvite'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAllowPublishMethodInvite')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefCalendarAutoAddInvites}
						onChange={changeSwitchOption}
						label={t(
							'account_details.add_appointments_when_invited',
							'Automatically add appointments when the user is invited'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarAutoAddInvites}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarAutoAddInvites}
						inputName={'zimbraPrefCalendarAutoAddInvites'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarAutoAddInvites')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
						onChange={changeSwitchOption}
						label={t(
							'account_details.auto_decline_if_inviter_is_blacklisted',
							`Auto-decline if the sender is blacklisted`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarSendInviteDeniedAutoReply}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarSendInviteDeniedAutoReply}
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
						accountValue={accountDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
						onChange={changeSwitchOption}
						label={t(
							'account_details.notify_changes_by_delegated_access',
							`Notify changes made by delegated accounts`
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefCalendarNotifyDelegatedChanges}
						fromAccount={accSpecificDetail?.zimbraPrefCalendarNotifyDelegatedChanges}
						inputName={'zimbraPrefCalendarNotifyDelegatedChanges'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefCalendarNotifyDelegatedChanges')}
					/>
				</Row>
				<Row width="48%" mainAlignment="flex-start">
					<InheritedSwitch
						accountValue={accountDetail?.zimbraPrefAppleIcalDelegationEnabled}
						onChange={changeSwitchOption}
						label={t(
							'account_details.use_ical_delegation_model_for_shared_calendars',
							'Use iCal delegation model for shared calendars'
						)}
						iconColor="primary"
						cosValue={cosDetail.zimbraPrefAppleIcalDelegationEnabled}
						fromAccount={accSpecificDetail?.zimbraPrefAppleIcalDelegationEnabled}
						inputName={'zimbraPrefAppleIcalDelegationEnabled'}
						onChangeReset={(): void => setEmptyValue('zimbraPrefAppleIcalDelegationEnabled')}
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountUserPrefrencesSection;
