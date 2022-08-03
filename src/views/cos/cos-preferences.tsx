/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Select,
	Switch,
	Padding,
	SnackbarManagerContext,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ListRow from '../list/list-row';
import {
	appointmentReminder,
	charactorSet,
	conversationGroupBy,
	timeZoneList
} from '../utility/utils';
import { useCosStore } from '../../store/cos/store';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData]: any = useState({});
	const setCos = useCosStore((state) => state.setCos);
	const [cosPreferences, setCosPreferences] = useState<any>({
		zimbraPrefMessageViewHtmlPreferred: 'FALSE',
		zimbraPrefGroupMailBy: {},
		zimbraPrefMailDefaultCharset: {},
		zimbraPrefMessageIdDedupingEnabled: 'FALSE',
		zimbraPrefMailToasterEnabled: 'FALSE',
		zimbraPrefMailPollingInterval: {},
		zimbraMailMinPollingInterval: '',
		zimbraMailMinPollingIntervalType: {},
		zimbraPrefMailLocalDeliveryDisabled: 'FALSE',
		zimbraPrefMailSendReadReceipts: {},
		zimbraPrefSaveToSent: 'FALSE',
		zimbraAllowAnyFromAddress: 'FALSE',
		zimbraPrefAutoAddAddressEnabled: 'FALSE',
		zimbraPrefGalAutoCompleteEnabled: 'FALSE',
		zimbraPrefCalendarFirstDayOfWeek: {},
		zimbraPrefTimeZoneId: {},
		zimbraPrefCalendarInitialView: {},
		zimbraPrefCalendarApptVisibility: {},
		zimbraPrefCalendarDefaultApptDuration: {},
		zimbraPrefCalendarApptReminderWarningTime: {},
		zimbraPrefCalendarShowPastDueReminders: 'FALSE',
		zimbraPrefCalendarToasterEnabled: 'FALSE',
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		zimbraPrefCalendarReminderSoundsEnabled: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		zimbraPrefCalendarUseQuickAdd: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE',
		zimbraPrefUseTimeZoneListInCalendar: 'FALSE'
	});
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const APPOINTMENT_REMINDER = useMemo(() => appointmentReminder(t), [t]);

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
			{ label: t('cos.default_view.month', 'Month View'), value: 'month' },
			{ label: t('cos.default_view.week', 'Week View'), value: 'week' },
			{ label: t('cos.default_view.day', 'Day View'), value: 'day' },
			{ label: t('cos.default_view.work_week', 'Work Week View'), value: 'workWeek' },
			{ label: t('cos.default_view.list', 'List View'), value: 'list' }
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

	const DEFAULT_APPOINTMENT_DURATION = useMemo(
		() => [
			{ label: `30 ${t('label.minutes', 'minutes')}`, value: '1800' },
			{ label: `60 ${t('label.minutes', 'minutes')}`, value: '3600' },
			{ label: `90 ${t('label.minutes', 'minutes')}`, value: '5400' },
			{ label: `120 ${t('label.minutes', 'minutes')}`, value: '7200' }
		],
		[t]
	);

	const SEND_READ_RECEIPTS = useMemo(
		() => [
			{ label: t('label.prompt', 'Prompt'), value: 'prompt' },
			{ label: t('label.always', 'Always'), value: 'always' },
			{ label: t('label.never', 'Never'), value: 'never' }
		],
		[t]
	);

	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('cos.as_new_mail_arrives', 'As New Mail Arrives'),
				value: '',
				disabled: true
			},
			{ label: `2 ${t('label.minutes', 'minutes')}`, value: '120s' },
			{ label: `3 ${t('label.minutes', 'minutes')}`, value: '180s' },
			{ label: `4 ${t('label.minutes', 'minutes')}`, value: '240s' },
			{ label: `5 ${t('label.minutes', 'minutes')}`, value: '300s' },
			{ label: `6 ${t('label.minutes', 'minutes')}`, value: '360s' },
			{ label: `7 ${t('label.minutes', 'minutes')}`, value: '420s' },
			{ label: `8 ${t('label.minutes', 'minutes')}`, value: '480s' },
			{ label: `9 ${t('label.minutes', 'minutes')}`, value: '540s' },
			{ label: `10 ${t('label.minutes', 'minutes')}`, value: '600s' },
			{ label: `15 ${t('label.minutes', 'minutes')}`, value: '900s' },
			{
				label: t('cos.manuallly', 'Manually'),
				value: '31536000s'
			}
		],
		[t]
	);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setCosPreferences((prev: any) => ({
				...prev,
				[key]: cosPreferences[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[cosPreferences, setCosPreferences]
	);

	const onGroupByChange = useCallback(
		(v: string): void => {
			const objItem = GROUP_BY.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefGroupMailBy) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefGroupMailBy: objItem }));
			}
		},
		[GROUP_BY, cosPreferences.zimbraPrefGroupMailBy]
	);

	const onCharactorSetChange = useCallback(
		(v: string): void => {
			const objItem = CHARACTOR_SET.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefMailDefaultCharset) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefMailDefaultCharset: objItem }));
			}
		},
		[CHARACTOR_SET, cosPreferences.zimbraPrefMailDefaultCharset]
	);

	const onPollingIntervalChange = useCallback(
		(v: string): void => {
			const objItem = POLLING_INTERVAL.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefMailPollingInterval) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefMailPollingInterval: objItem }));
			}
		},
		[POLLING_INTERVAL, cosPreferences.zimbraPrefMailPollingInterval]
	);

	const onPrefMailPollingIntervalTypeChange = useCallback(
		(v: string) => {
			const objItem = TIME_TYPES.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefMailMinPollingIntervalType) {
				setCosPreferences((prev: any) => ({
					...prev,
					zimbraPrefMailMinPollingIntervalType: objItem
				}));
			}
		},
		[TIME_TYPES, cosPreferences.zimbraPrefMailMinPollingIntervalType]
	);

	const onPrefMailPollingIntervalNumChange = useCallback(
		(e) => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraPrefMailMinPollingInterval: `${e.target.value}`
			}));
		},
		[setCosPreferences]
	);

	const onMailSendReadReceipts = useCallback(
		(v: string) => {
			const objItem = SEND_READ_RECEIPTS.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefMailSendReadReceipts) {
				setCosPreferences((prev: any) => ({
					...prev,
					zimbraPrefMailSendReadReceipts: objItem
				}));
			}
		},
		[SEND_READ_RECEIPTS, cosPreferences.zimbraPrefMailSendReadReceipts]
	);

	const onPrefTimeZoneChange = useCallback(
		(v: string): void => {
			const objItem = timezones.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefTimeZoneId) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefTimeZoneId: objItem }));
			}
		},
		[cosPreferences.zimbraPrefTimeZoneId, timezones]
	);

	const onCalendarDefaultApptDurationChange = useCallback(
		(v: string): void => {
			const objItem = DEFAULT_APPOINTMENT_DURATION.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefCalendarDefaultApptDuration) {
				setCosPreferences((prev: any) => ({
					...prev,
					zimbraPrefCalendarDefaultApptDuration: objItem
				}));
			}
		},
		[DEFAULT_APPOINTMENT_DURATION, cosPreferences.zimbraPrefCalendarDefaultApptDuration]
	);

	const onReminderWarningTimeChange = useCallback(
		(v: string): void => {
			const objItem = APPOINTMENT_REMINDER.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefCalendarApptReminderWarningTime) {
				setCosPreferences((prev: any) => ({
					...prev,
					zimbraPrefCalendarApptReminderWarningTime: objItem
				}));
			}
		},
		[APPOINTMENT_REMINDER, cosPreferences.zimbraPrefCalendarApptReminderWarningTime]
	);

	const onCalendarInitialViewChange = useCallback(
		(v: string): void => {
			const objItem = DefaultViewOptions.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefCalendarInitialView) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarInitialView: objItem }));
			}
		},
		[DefaultViewOptions, cosPreferences.zimbraPrefCalendarInitialView]
	);

	const onFirstDayOfWeekChange = useCallback(
		(v: string): void => {
			const objItem = FIRST_DAY_OF_WEEK.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefCalendarFirstDayOfWeek) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarFirstDayOfWeek: objItem }));
			}
		},
		[FIRST_DAY_OF_WEEK, cosPreferences.zimbraPrefCalendarFirstDayOfWeek]
	);

	const onAppointmentVisibilityChange = useCallback(
		(v: string): void => {
			const objItem = APPOINTMENT_VISIBILITY.find((item: any) => item.value === v);
			if (objItem !== cosPreferences.zimbraPrefCalendarApptVisibility) {
				setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarApptVisibility: objItem }));
			}
		},
		[APPOINTMENT_VISIBILITY, cosPreferences.zimbraPrefCalendarApptVisibility]
	);

	const setValue = useCallback(
		(key: string, value: any): void => {
			setCosPreferences((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosPreferences]
	);

	const setInitalValues = useCallback(
		(obj: any): void => {
			if (obj) {
				setValue(
					'zimbraPrefMessageViewHtmlPreferred',
					obj?.zimbraPrefMessageViewHtmlPreferred ? obj.zimbraPrefMessageViewHtmlPreferred : 'FALSE'
				);
				setValue(
					'zimbraPrefGroupMailBy',
					obj?.zimbraPrefGroupMailBy
						? GROUP_BY.find((item: any) => item.value === obj?.zimbraPrefGroupMailBy)
						: {}
				);
				setValue(
					'zimbraPrefMailDefaultCharset',
					obj?.zimbraPrefMailDefaultCharset
						? CHARACTOR_SET.find((item: any) => item.value === obj?.zimbraPrefMailDefaultCharset)
						: {}
				);
				setValue(
					'zimbraPrefMessageIdDedupingEnabled',
					obj?.zimbraPrefMessageIdDedupingEnabled
						? obj?.zimbraPrefMessageIdDedupingEnabled
						: 'FALSE'
				);
				setValue(
					'zimbraPrefMailToasterEnabled',
					obj?.zimbraPrefMailToasterEnabled ? obj.zimbraPrefMailToasterEnabled : 'FALSE'
				);
				setValue(
					'zimbraPrefMailPollingInterval',
					obj?.zimbraPrefMailPollingInterval
						? POLLING_INTERVAL.find(
								(item: any) => item.value === obj?.zimbraPrefMailPollingInterval
						  )
						: {}
				);
				setValue(
					'zimbraPrefMailLocalDeliveryDisabled',
					obj?.zimbraPrefMailLocalDeliveryDisabled
						? obj?.zimbraPrefMailLocalDeliveryDisabled
						: 'FALSE'
				);
				setValue(
					'zimbraMailMinPollingInterval',
					obj?.zimbraMailMinPollingInterval ? obj?.zimbraMailMinPollingInterval?.slice(0, -1) : ''
				);
				setValue(
					'zimbraMailMinPollingIntervalType',
					obj?.zimbraMailMinPollingInterval
						? TIME_TYPES.find(
								(item: any) => item.value === obj?.zimbraMailMinPollingInterval?.slice(-1)
						  )
						: {}
				);
				setValue(
					'zimbraPrefMailSendReadReceipts',
					obj?.zimbraPrefMailSendReadReceipts
						? SEND_READ_RECEIPTS.find(
								(item: any) => item.value === obj?.zimbraPrefMailSendReadReceipts
						  )
						: {}
				);
				setValue(
					'zimbraPrefSaveToSent',
					obj?.zimbraPrefSaveToSent ? obj?.zimbraPrefSaveToSent : 'FALSE'
				);
				setValue(
					'zimbraAllowAnyFromAddress',
					obj?.zimbraAllowAnyFromAddress ? obj?.zimbraAllowAnyFromAddress : 'FALSE'
				);
				setValue(
					'zimbraPrefAutoAddAddressEnabled',
					obj?.zimbraPrefAutoAddAddressEnabled ? obj?.zimbraPrefAutoAddAddressEnabled : 'FALSE'
				);
				setValue(
					'zimbraPrefGalAutoCompleteEnabled',
					obj?.zimbraPrefGalAutoCompleteEnabled ? obj?.zimbraPrefGalAutoCompleteEnabled : 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarFirstDayOfWeek',
					obj?.zimbraPrefCalendarFirstDayOfWeek
						? FIRST_DAY_OF_WEEK.find(
								(item: any) => item.value === obj?.zimbraPrefCalendarFirstDayOfWeek
						  )
						: {}
				);
				setValue(
					'zimbraPrefTimeZoneId',
					obj?.zimbraPrefTimeZoneId
						? timezones.find((item: any) => item.value === obj?.zimbraPrefTimeZoneId)
						: {}
				);
				setValue(
					'zimbraPrefCalendarInitialView',
					obj?.zimbraPrefCalendarInitialView
						? DefaultViewOptions.find(
								(item: any) => item.value === obj?.zimbraPrefCalendarInitialView
						  )
						: {}
				);
				setValue(
					'zimbraPrefCalendarApptVisibility',
					obj?.zimbraPrefCalendarApptVisibility
						? APPOINTMENT_VISIBILITY.find(
								(item: any) => item.value === obj?.zimbraPrefCalendarApptVisibility
						  )
						: {}
				);
				setValue(
					'zimbraPrefCalendarDefaultApptDuration',
					obj?.zimbraPrefCalendarDefaultApptDuration
						? DEFAULT_APPOINTMENT_DURATION.find(
								(item: any) => item.value === obj?.zimbraPrefCalendarDefaultApptDuration
						  )
						: {}
				);
				setValue(
					'zimbraPrefCalendarApptReminderWarningTime',
					obj?.zimbraPrefCalendarApptReminderWarningTime
						? APPOINTMENT_REMINDER.find(
								(item: any) => item.value === obj?.zimbraPrefCalendarApptReminderWarningTime
						  )
						: {}
				);
				setValue(
					'zimbraPrefCalendarShowPastDueReminders',
					obj?.zimbraPrefCalendarShowPastDueReminders
						? obj?.zimbraPrefCalendarShowPastDueReminders
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarToasterEnabled',
					obj?.zimbraPrefCalendarToasterEnabled ? obj?.zimbraPrefCalendarToasterEnabled : 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarAllowCancelEmailToSelf',
					obj?.zimbraPrefCalendarAllowCancelEmailToSelf
						? obj?.zimbraPrefCalendarAllowCancelEmailToSelf
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarAllowPublishMethodInvite',
					obj?.zimbraPrefCalendarAllowPublishMethodInvite
						? obj?.zimbraPrefCalendarAllowPublishMethodInvite
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarAllowForwardedInvite',
					obj?.zimbraPrefCalendarAllowForwardedInvite
						? obj?.zimbraPrefCalendarAllowForwardedInvite
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarAutoAddInvites',
					obj?.zimbraPrefCalendarAutoAddInvites ? obj?.zimbraPrefCalendarAutoAddInvites : 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarReminderSoundsEnabled',
					obj?.zimbraPrefCalendarReminderSoundsEnabled
						? obj?.zimbraPrefCalendarReminderSoundsEnabled
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarSendInviteDeniedAutoReply',
					obj?.zimbraPrefCalendarSendInviteDeniedAutoReply
						? obj?.zimbraPrefCalendarSendInviteDeniedAutoReply
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarNotifyDelegatedChanges',
					obj?.zimbraPrefCalendarNotifyDelegatedChanges
						? obj?.zimbraPrefCalendarNotifyDelegatedChanges
						: 'FALSE'
				);
				setValue(
					'zimbraPrefCalendarUseQuickAdd',
					obj?.zimbraPrefCalendarUseQuickAdd ? obj?.zimbraPrefCalendarUseQuickAdd : 'FALSE'
				);
				setValue(
					'zimbraPrefAppleIcalDelegationEnabled',
					obj?.zimbraPrefAppleIcalDelegationEnabled
						? obj?.zimbraPrefAppleIcalDelegationEnabled
						: 'FALSE'
				);
				setValue(
					'zimbraPrefUseTimeZoneListInCalendar',
					obj?.zimbraPrefUseTimeZoneListInCalendar
						? obj?.zimbraPrefUseTimeZoneListInCalendar
						: 'FALSE'
				);
			}
		},
		[
			APPOINTMENT_REMINDER,
			APPOINTMENT_VISIBILITY,
			CHARACTOR_SET,
			DEFAULT_APPOINTMENT_DURATION,
			DefaultViewOptions,
			FIRST_DAY_OF_WEEK,
			GROUP_BY,
			POLLING_INTERVAL,
			SEND_READ_RECEIPTS,
			TIME_TYPES,
			setValue,
			timezones
		]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.map((item: any) => {
				obj[item?.n] = item._content;
				return '';
			});
			if (!obj.zimbraPrefMessageViewHtmlPreferred) {
				obj.zimbraPrefMessageViewHtmlPreferred = 'FALSE';
			}
			if (!obj.zimbraPrefGroupMailBy) {
				obj.zimbraPrefGroupMailBy = {};
			}
			if (!obj.zimbraPrefMailDefaultCharset) {
				obj.zimbraPrefMailDefaultCharset = {};
			}
			if (!obj.zimbraPrefMessageIdDedupingEnabled) {
				obj.zimbraPrefMessageIdDedupingEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefMailToasterEnabled) {
				obj.zimbraPrefMailToasterEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefMailPollingInterval) {
				obj.zimbraPrefMailPollingInterval = {};
			}
			if (!obj.zimbraPrefMailLocalDeliveryDisabled) {
				obj.zimbraPrefMailLocalDeliveryDisabled = 'FALSE';
			}
			if (!obj.zimbraMailMinPollingInterval) {
				obj.zimbraMailMinPollingInterval = '';
				obj.zimbraMailMinPollingIntervalType = {};
			}
			if (!obj.zimbraPrefMailSendReadReceipts) {
				obj.zimbraPrefMailSendReadReceipts = {};
			}
			if (!obj.zimbraPrefSaveToSent) {
				obj.zimbraPrefSaveToSent = 'FALSE';
			}
			if (!obj.zimbraAllowAnyFromAddress) {
				obj.zimbraAllowAnyFromAddress = 'FALSE';
			}
			if (!obj.zimbraPrefAutoAddAddressEnabled) {
				obj.zimbraPrefAutoAddAddressEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefGalAutoCompleteEnabled) {
				obj.zimbraPrefGalAutoCompleteEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarFirstDayOfWeek) {
				obj.zimbraPrefCalendarFirstDayOfWeek = {};
			}
			if (!obj.zimbraPrefTimeZoneId) {
				obj.zimbraPrefTimeZoneId = {};
			}
			if (!obj.zimbraPrefCalendarInitialView) {
				obj.zimbraPrefCalendarInitialView = {};
			}
			if (!obj.zimbraPrefCalendarApptVisibility) {
				obj.zimbraPrefCalendarApptVisibility = {};
			}
			if (!obj.zimbraPrefCalendarDefaultApptDuration) {
				obj.zimbraPrefCalendarDefaultApptDuration = {};
			}
			if (!obj.zimbraPrefCalendarApptReminderWarningTime) {
				obj.zimbraPrefCalendarApptReminderWarningTime = {};
			}
			if (!obj.zimbraPrefCalendarShowPastDueReminders) {
				obj.zimbraPrefCalendarShowPastDueReminders = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarToasterEnabled) {
				obj.zimbraPrefCalendarToasterEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarAllowCancelEmailToSelf) {
				obj.zimbraPrefCalendarAllowCancelEmailToSelf = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarAllowPublishMethodInvite) {
				obj.zimbraPrefCalendarAllowPublishMethodInvite = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarAllowForwardedInvite) {
				obj.zimbraPrefCalendarAllowForwardedInvite = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarAutoAddInvites) {
				obj.zimbraPrefCalendarAutoAddInvites = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarReminderSoundsEnabled) {
				obj.zimbraPrefCalendarReminderSoundsEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarSendInviteDeniedAutoReply) {
				obj.zimbraPrefCalendarSendInviteDeniedAutoReply = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarNotifyDelegatedChanges) {
				obj.zimbraPrefCalendarNotifyDelegatedChanges = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarUseQuickAdd) {
				obj.zimbraPrefCalendarUseQuickAdd = 'FALSE';
			}
			if (!obj.zimbraPrefAppleIcalDelegationEnabled) {
				obj.zimbraPrefAppleIcalDelegationEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefUseTimeZoneListInCalendar) {
				obj.zimbraPrefUseTimeZoneListInCalendar = 'FALSE';
			}
			setCosData(obj);
			setInitalValues(obj);
			setIsDirty(false);
		}
	}, [cosInformation, setInitalValues]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMessageViewHtmlPreferred !== undefined &&
			cosData.zimbraPrefMessageViewHtmlPreferred !==
				cosPreferences.zimbraPrefMessageViewHtmlPreferred
		) {
			setIsDirty(true);
		}
	}, [
		cosPreferences.zimbraPrefMessageViewHtmlPreferred,
		cosData.zimbraPrefMessageViewHtmlPreferred
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefGroupMailBy !== undefined &&
			_.isEqual(cosData.zimbraPrefGroupMailBy, cosPreferences.zimbraPrefGroupMailBy?.value)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefGroupMailBy, cosPreferences.zimbraPrefGroupMailBy?.value]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailDefaultCharset !== undefined &&
			_.isEqual(
				cosData.zimbraPrefMailDefaultCharset,
				cosPreferences.zimbraPrefMailDefaultCharset?.value
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailDefaultCharset, cosPreferences.zimbraPrefMailDefaultCharset?.value]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMessageIdDedupingEnabled !== undefined &&
			cosData.zimbraPrefMessageIdDedupingEnabled !==
				cosPreferences.zimbraPrefMessageIdDedupingEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefMessageIdDedupingEnabled,
		cosPreferences.zimbraPrefMessageIdDedupingEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailToasterEnabled !== undefined &&
			cosData.zimbraPrefMailToasterEnabled !== cosPreferences.zimbraPrefMailToasterEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailToasterEnabled, cosPreferences.zimbraPrefMailToasterEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailPollingInterval !== undefined &&
			_.isEqual(
				cosData.zimbraPrefMailPollingInterval,
				cosPreferences.zimbraPrefMailPollingInterval?.value
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailPollingInterval, cosPreferences.zimbraPrefMailPollingInterval?.value]);

	useEffect(() => {
		if (
			cosData.zimbraMailMinPollingInterval !== undefined &&
			cosData.zimbraMailMinPollingInterval !==
				`${cosPreferences.zimbraMailMinPollingInterval}${cosPreferences.zimbraMailMinPollingIntervalType?.value}`
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraMailMinPollingInterval,
		cosPreferences.zimbraMailMinPollingInterval,
		cosPreferences.zimbraMailMinPollingIntervalType?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailLocalDeliveryDisabled !== undefined &&
			cosData.zimbraPrefMailLocalDeliveryDisabled !==
				cosPreferences.zimbraPrefMailLocalDeliveryDisabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefMailLocalDeliveryDisabled,
		cosPreferences.zimbraPrefMailLocalDeliveryDisabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailSendReadReceipts !== undefined &&
			_.isEqual(
				cosData.zimbraPrefMailSendReadReceipts,
				cosPreferences.zimbraPrefMailSendReadReceipts?.value
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefMailSendReadReceipts,
		cosPreferences.zimbraPrefMailSendReadReceipts?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefSaveToSent !== undefined &&
			cosData.zimbraPrefSaveToSent !== cosPreferences.zimbraPrefSaveToSent
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefSaveToSent, cosPreferences.zimbraPrefSaveToSent]);

	useEffect(() => {
		if (
			cosData.zimbraAllowAnyFromAddress !== undefined &&
			cosData.zimbraAllowAnyFromAddress !== cosPreferences.zimbraAllowAnyFromAddress
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraAllowAnyFromAddress, cosPreferences.zimbraAllowAnyFromAddress]);

	useEffect(() => {
		if (
			cosData.zimbraPrefAutoAddAddressEnabled !== undefined &&
			cosData.zimbraPrefAutoAddAddressEnabled !== cosPreferences.zimbraPrefAutoAddAddressEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefAutoAddAddressEnabled, cosPreferences.zimbraPrefAutoAddAddressEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefGalAutoCompleteEnabled !== undefined &&
			cosData.zimbraPrefGalAutoCompleteEnabled !== cosPreferences.zimbraPrefGalAutoCompleteEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefGalAutoCompleteEnabled, cosPreferences.zimbraPrefGalAutoCompleteEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarFirstDayOfWeek !== undefined &&
			_.isEqual(
				cosData.zimbraPrefCalendarFirstDayOfWeek,
				cosPreferences.zimbraPrefCalendarFirstDayOfWeek?.value
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarFirstDayOfWeek,
		cosPreferences.zimbraPrefCalendarFirstDayOfWeek?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefTimeZoneId !== undefined &&
			_.isEqual(cosData.zimbraPrefTimeZoneId, cosPreferences.zimbraPrefTimeZoneId?.value)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefTimeZoneId, cosPreferences.zimbraPrefTimeZoneId?.value]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarInitialView !== undefined &&
			_.isEqual(
				cosData.zimbraPrefCalendarInitialView,
				cosPreferences.zimbraPrefCalendarInitialView?.value
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarInitialView, cosPreferences.zimbraPrefCalendarInitialView?.value]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptVisibility !== undefined &&
			_.isEqual(
				cosData.zimbraPrefCalendarApptVisibility,
				cosPreferences.zimbraPrefCalendarApptVisibility?.value
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarApptVisibility,
		cosPreferences.zimbraPrefCalendarApptVisibility?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarDefaultApptDuration !== undefined &&
			_.isEqual(
				cosData.zimbraPrefCalendarDefaultApptDuration,
				cosPreferences.zimbraPrefCalendarDefaultApptDuration?.value
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarDefaultApptDuration,
		cosPreferences.zimbraPrefCalendarDefaultApptDuration?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptReminderWarningTime !== undefined &&
			_.isEqual(
				cosData.zimbraPrefCalendarApptReminderWarningTime,
				cosPreferences.zimbraPrefCalendarApptReminderWarningTime?.value
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarApptReminderWarningTime,
		cosPreferences.zimbraPrefCalendarApptReminderWarningTime?.value
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarShowPastDueReminders !== undefined &&
			cosData.zimbraPrefCalendarShowPastDueReminders !==
				cosPreferences.zimbraPrefCalendarShowPastDueReminders
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarShowPastDueReminders,
		cosPreferences.zimbraPrefCalendarShowPastDueReminders
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarToasterEnabled !== undefined &&
			cosData.zimbraPrefCalendarToasterEnabled !== cosPreferences.zimbraPrefCalendarToasterEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarToasterEnabled, cosPreferences.zimbraPrefCalendarToasterEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowCancelEmailToSelf !== undefined &&
			cosData.zimbraPrefCalendarAllowCancelEmailToSelf !==
				cosPreferences.zimbraPrefCalendarAllowCancelEmailToSelf
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowCancelEmailToSelf,
		cosPreferences.zimbraPrefCalendarAllowCancelEmailToSelf
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowPublishMethodInvite !== undefined &&
			cosData.zimbraPrefCalendarAllowPublishMethodInvite !==
				cosPreferences.zimbraPrefCalendarAllowPublishMethodInvite
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowPublishMethodInvite,
		cosPreferences.zimbraPrefCalendarAllowPublishMethodInvite
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAutoAddInvites !== undefined &&
			cosData.zimbraPrefCalendarAutoAddInvites !== cosPreferences.zimbraPrefCalendarAutoAddInvites
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarAutoAddInvites, cosPreferences.zimbraPrefCalendarAutoAddInvites]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowForwardedInvite !== undefined &&
			cosData.zimbraPrefCalendarAllowForwardedInvite !==
				cosPreferences.zimbraPrefCalendarAllowForwardedInvite
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowForwardedInvite,
		cosPreferences.zimbraPrefCalendarAllowForwardedInvite
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarReminderSoundsEnabled !== undefined &&
			cosData.zimbraPrefCalendarReminderSoundsEnabled !==
				cosPreferences.zimbraPrefCalendarReminderSoundsEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarReminderSoundsEnabled,
		cosPreferences.zimbraPrefCalendarReminderSoundsEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarSendInviteDeniedAutoReply !== undefined &&
			cosData.zimbraPrefCalendarSendInviteDeniedAutoReply !==
				cosPreferences.zimbraPrefCalendarSendInviteDeniedAutoReply
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarSendInviteDeniedAutoReply,
		cosPreferences.zimbraPrefCalendarSendInviteDeniedAutoReply
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarNotifyDelegatedChanges !== undefined &&
			cosData.zimbraPrefCalendarNotifyDelegatedChanges !==
				cosPreferences.zimbraPrefCalendarNotifyDelegatedChanges
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarNotifyDelegatedChanges,
		cosPreferences.zimbraPrefCalendarNotifyDelegatedChanges
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarUseQuickAdd !== undefined &&
			cosData.zimbraPrefCalendarUseQuickAdd !== cosPreferences.zimbraPrefCalendarUseQuickAdd
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarUseQuickAdd, cosPreferences.zimbraPrefCalendarUseQuickAdd]);

	useEffect(() => {
		if (
			cosData.zimbraPrefAppleIcalDelegationEnabled !== undefined &&
			cosData.zimbraPrefAppleIcalDelegationEnabled !==
				cosPreferences.zimbraPrefAppleIcalDelegationEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefAppleIcalDelegationEnabled,
		cosPreferences.zimbraPrefAppleIcalDelegationEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefUseTimeZoneListInCalendar !== undefined &&
			cosData.zimbraPrefUseTimeZoneListInCalendar !==
				cosPreferences.zimbraPrefUseTimeZoneListInCalendar
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefUseTimeZoneListInCalendar,
		cosPreferences.zimbraPrefUseTimeZoneListInCalendar
	]);

	const onCancel = (): void => {
		setInitalValues(cosData);
		setIsDirty(false);
	};

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.preferences', 'Preferences')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && <Button label={t('label.save', 'Save')} color="primary" />}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<Switch
								value={cosPreferences?.zimbraPrefMessageViewHtmlPreferred === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefMessageViewHtmlPreferred')}
								label={t('cos.view_mail_as_html', 'View mail as HTML')}
							/>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.display_by', 'Display by')}
										showCheckbox={false}
										items={GROUP_BY}
										selection={cosPreferences?.zimbraPrefGroupMailBy}
										onChange={onGroupByChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.default_charset', 'Default Charset')}
										showCheckbox={false}
										items={CHARACTOR_SET}
										selection={cosPreferences?.zimbraPrefMailDefaultCharset}
										onChange={onCharactorSetChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefMessageIdDedupingEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefMessageIdDedupingEnabled')}
										label={t(
											'cos.auto_delete_duplicate_messages',
											'Auto-Delete duplicate messages'
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefMailToasterEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefMailToasterEnabled')}
										label={t(
											'cos.enable_notification_for_new_email',
											`Enable notification for new email`
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.receiving_mails', 'Receiving Mails')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Input
										inputName="zimbraPrefMailMinPollingInterval"
										label={t('cos.check_new_mail_every', 'Check new mail every')}
										backgroundColor="gray5"
										value={cosPreferences.zimbraMailMinPollingInterval}
										type="number"
										onChange={onPrefMailPollingIntervalNumChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={TIME_TYPES}
										background="gray5"
										label={t('cos.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
										showCheckbox={false}
										selection={cosPreferences.zimbraMailMinPollingIntervalType}
										onChange={onPrefMailPollingIntervalTypeChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="center" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
										label={t('cos.cannot_check_for_less_than', `Cannot check for less than`)}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={POLLING_INTERVAL}
										background="gray5"
										label={t('cos.min_new_check_interval_value', 'Min new check interval (value)')}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefMailPollingInterval}
										onChange={onPollingIntervalChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<Select
								items={SEND_READ_RECEIPTS}
								background="gray5"
								label={t('cos.send_read_receipts', 'Send read receipts')}
								showCheckbox={false}
								selection={cosPreferences?.zimbraPrefMailSendReadReceipts}
								onChange={onMailSendReadReceipts}
							/>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.sending_mails', 'Sending Mails')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefSaveToSent === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefSaveToSent')}
										label={t('cos.save_to_Sent', `Save to sent`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraAllowAnyFromAddress === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
										label={t(
											'cos.allow_sending_from_any_address',
											'Allow sending from any address'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.contact_options', 'Contact Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefAutoAddAddressEnabled')}
										label={t('cos.enable_auto_add_contacts', `Enable auto-add contacts`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
										label={t('cos.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.calendar_options', 'Calendar Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										items={timezones}
										background="gray5"
										label={t('label.time_zone', 'Time Zone')}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefTimeZoneId}
										onChange={onPrefTimeZoneChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={DEFAULT_APPOINTMENT_DURATION}
										background="gray5"
										label={t(
											'label.appointments_default_duration',
											'Appointment’s Default Duration'
										)}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefCalendarDefaultApptDuration}
										onChange={onCalendarDefaultApptDurationChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										items={APPOINTMENT_REMINDER}
										background="gray5"
										label={t('label.remind_appointments_timer', 'Remind Appointments Timer')}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefCalendarApptReminderWarningTime}
										onChange={onReminderWarningTimeChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={DefaultViewOptions}
										background="gray5"
										label={t('label.initial_calendar_view', 'Initial Calendar View')}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefCalendarInitialView}
										onChange={onCalendarInitialViewChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container padding={{ right: 'small' }}>
									<Select
										items={FIRST_DAY_OF_WEEK}
										background="gray5"
										label={t('label.first_day_of_week', 'First Day of Week')}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefCalendarFirstDayOfWeek}
										onChange={onFirstDayOfWeekChange}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={APPOINTMENT_VISIBILITY}
										background="gray5"
										label={t(
											'label.default_appointment_visibility',
											'Default Appointment visibility'
										)}
										showCheckbox={false}
										selection={cosPreferences?.zimbraPrefCalendarApptVisibility}
										onChange={onAppointmentVisibilityChange}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarShowPastDueReminders')
										}
										label={t('cos.enable_past_due_reminders', `Enable past-due reminders`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarToasterEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefCalendarToasterEnabled')}
										label={t(
											'cos.enable_notification_for_new_appointment',
											'Enable notification for new appointment'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarAllowCancelEmailToSelf')
										}
										label={t(
											'cos.allow_sending_cancellation_mail',
											`Allow sending cancellation mail`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarAllowPublishMethodInvite === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarAllowPublishMethodInvite')
										}
										label={t(
											'cos.add_invites_with_publish_method',
											'Add invites with PUBLISH method'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarAllowForwardedInvite === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarAllowForwardedInvite')
										}
										label={t(
											'cos.add_forwarded_invites_to_calendar',
											`Add forwarded invites to calendar`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarReminderSoundsEnabled')
										}
										label={t('cos.audible_reminder_notification', 'Audible reminder notification')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefCalendarAutoAddInvites')}
										label={t('cos.add_appointments_when_invited', `Add appointments when invited`)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarSendInviteDeniedAutoReply')
										}
										label={t(
											'cos.auto_decline_if_inviter_is_blacklisted',
											'Auto-decline if inviter is blacklisted'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarNotifyDelegatedChanges === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarNotifyDelegatedChanges')
										}
										label={t(
											'cos.notify_changes_by_delegated_access',
											`Notify changes by delegated access`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarUseQuickAdd === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefCalendarUseQuickAdd')}
										label={t(
											'cos.use_quickadd_dialog_in_creation',
											'Use QuickAdd dialog in creation'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefAppleIcalDelegationEnabled')}
										label={t(
											'cos.use_ical_delegation_model_for_shared_calendars',
											`Use iCal delegation model for shared calendars`
										)}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefUseTimeZoneListInCalendar === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefUseTimeZoneListInCalendar')}
										label={t('cos.show_time_zone_lists_in_view', 'Show time zone lists in view')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
			</Container>
		</Container>
	);
};

export default CosPreferences;
