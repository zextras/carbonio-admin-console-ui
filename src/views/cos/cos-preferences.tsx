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
import { isEqual, find } from 'lodash';
import ListRow from '../list/list-row';
import {
	appointmentReminder,
	charactorSet,
	conversationGroupBy,
	timeZoneList,
	localeList
} from '../utility/utils';
import { useCosStore } from '../../store/cos/store';
import { modifyCos } from '../../services/modify-cos-service';
import { useRightsStore, Right, Rights } from '../../store/rights/store';
import { COS } from '../../constants';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData]: any = useState({});
	const setCos = useCosStore((state) => state.setCos);
	const localeZone = useMemo(() => localeList(t), [t]);
	const rights: Rights = useRightsStore((state) => state.rights);

	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		if (rightsConfig?.all?.[0]?.setAttrs?.[0]?.all) {
			return false;
		}
		return true;
	}, [rights]);

	const [cosPreferences, setCosPreferences] = useState<any>({
		zimbraPrefLocale: '',
		zimbraPrefMessageViewHtmlPreferred: 'FALSE',
		zimbraPrefGroupMailBy: '',
		zimbraPrefMailDefaultCharset: '',
		zimbraPrefMessageIdDedupingEnabled: 'FALSE',
		zimbraPrefMailToasterEnabled: 'FALSE',
		zimbraPrefMailPollingInterval: '',
		zimbraMailMinPollingInterval: '',
		zimbraPrefMailSendReadReceipts: '',
		zimbraPrefSaveToSent: 'FALSE',
		zimbraFeatureMailForwardingEnabled: 'FALSE',
		zimbraFeatureMailForwardingInFiltersEnabled: 'FALSE',
		zimbraAllowAnyFromAddress: 'FALSE',
		zimbraPrefAutoAddAddressEnabled: 'FALSE',
		zimbraPrefGalAutoCompleteEnabled: 'FALSE',
		zimbraPrefCalendarFirstDayOfWeek: '',
		zimbraPrefTimeZoneId: '',
		zimbraPrefCalendarInitialView: '',
		zimbraPrefCalendarApptVisibility: '',
		zimbraPrefCalendarDefaultApptDuration: '',
		zimbraPrefCalendarApptReminderWarningTime: '',
		zimbraPrefCalendarShowPastDueReminders: 'FALSE',
		// zimbraPrefCalendarToasterEnabled: 'FALSE',
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		// zimbraPrefCalendarReminderSoundsEnabled: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		// zimbraPrefCalendarUseQuickAdd: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE'
		// zimbraPrefUseTimeZoneListInCalendar: 'FALSE'
	});
	const [zimbraPrefMailPollingIntervalNum, setZimbraPrefMailPollingIntervalNum] = useState(
		cosPreferences?.zimbraMailMinPollingInterval?.slice(0, -1) || ''
	);
	const [prefMailPollingIntervalType, setPrefMailPollingIntervalType] = useState(
		cosPreferences?.zimbraMailMinPollingInterval?.slice(-1) || ''
	);
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
			{ label: `30 ${t('label.minutes', 'minutes')}`, value: '30m' },
			{ label: `60 ${t('label.minutes', 'minutes')}`, value: '60m' },
			{ label: `90 ${t('label.minutes', 'minutes')}`, value: '90m' },
			{ label: `120 ${t('label.minutes', 'minutes')}`, value: '120m' }
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

	const POLLING_INTERVAL = useMemo(
		() => [
			{
				label: t('cos.as_new_mail_arrives', 'As New Mail Arrives'),
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
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefGroupMailBy: v }));
		},
		[setCosPreferences]
	);

	const onCharactorSetChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefMailDefaultCharset: v }));
		},
		[setCosPreferences]
	);

	const onPrefLocaleChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefLocale: v }));
		},
		[setCosPreferences]
	);

	const onPollingIntervalChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefMailPollingInterval: v }));
		},
		[setCosPreferences]
	);

	const onPrefMailPollingIntervalTypeChange = useCallback(
		(v: string) => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraMailMinPollingInterval: zimbraPrefMailPollingIntervalNum
					? `${zimbraPrefMailPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraPrefMailPollingIntervalNum, setCosPreferences]
	);
	const onPrefMailPollingIntervalNumChange = useCallback(
		(e) => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraMailMinPollingInterval: e.target.value
					? `${e.target.value}${prefMailPollingIntervalType}`
					: ''
			}));
			setZimbraPrefMailPollingIntervalNum(e.target.value);
		},
		[setCosPreferences, prefMailPollingIntervalType]
	);

	const onMailSendReadReceipts = useCallback(
		(v: string) => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraPrefMailSendReadReceipts: v
			}));
		},
		[setCosPreferences]
	);

	const onPrefTimeZoneChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefTimeZoneId: v }));
		},
		[setCosPreferences]
	);

	const onCalendarDefaultApptDurationChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraPrefCalendarDefaultApptDuration: v
			}));
		},
		[setCosPreferences]
	);

	const onReminderWarningTimeChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({
				...prev,
				zimbraPrefCalendarApptReminderWarningTime: v
			}));
		},
		[setCosPreferences]
	);

	const onCalendarInitialViewChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarInitialView: v }));
		},
		[setCosPreferences]
	);

	const onFirstDayOfWeekChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarFirstDayOfWeek: v }));
		},
		[setCosPreferences]
	);

	const onAppointmentVisibilityChange = useCallback(
		(v: string): void => {
			setCosPreferences((prev: any) => ({ ...prev, zimbraPrefCalendarApptVisibility: v }));
		},
		[setCosPreferences]
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
				setValue('zimbraPrefLocale', obj?.zimbraPrefLocale ? obj?.zimbraPrefLocale : '');
				setValue(
					'zimbraPrefGroupMailBy',
					obj?.zimbraPrefGroupMailBy ? obj?.zimbraPrefGroupMailBy : ''
				);
				setValue(
					'zimbraPrefMailDefaultCharset',
					obj?.zimbraPrefMailDefaultCharset ? obj?.zimbraPrefMailDefaultCharset : ''
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
					obj?.zimbraPrefMailPollingInterval ? obj?.zimbraPrefMailPollingInterval : ''
				);
				setValue(
					'zimbraMailMinPollingInterval',
					obj?.zimbraMailMinPollingInterval ? obj?.zimbraMailMinPollingInterval : ''
				);
				setValue(
					'zimbraPrefMailSendReadReceipts',
					obj?.zimbraPrefMailSendReadReceipts ? obj?.zimbraPrefMailSendReadReceipts : ''
				);
				setValue(
					'zimbraPrefSaveToSent',
					obj?.zimbraPrefSaveToSent ? obj?.zimbraPrefSaveToSent : 'FALSE'
				);
				setValue(
					'zimbraFeatureMailForwardingEnabled',
					obj?.zimbraFeatureMailForwardingEnabled
						? obj?.zimbraFeatureMailForwardingEnabled
						: 'FALSE'
				);
				setValue(
					'zimbraFeatureMailForwardingInFiltersEnabled',
					obj?.zimbraFeatureMailForwardingInFiltersEnabled
						? obj?.zimbraFeatureMailForwardingInFiltersEnabled
						: 'FALSE'
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
					obj?.zimbraPrefCalendarFirstDayOfWeek ? obj?.zimbraPrefCalendarFirstDayOfWeek : ''
				);
				setValue(
					'zimbraPrefTimeZoneId',
					obj?.zimbraPrefTimeZoneId ? obj?.zimbraPrefTimeZoneId : ''
				);
				setValue(
					'zimbraPrefCalendarInitialView',
					obj?.zimbraPrefCalendarInitialView ? obj?.zimbraPrefCalendarInitialView : ''
				);
				setValue(
					'zimbraPrefCalendarApptVisibility',
					obj?.zimbraPrefCalendarApptVisibility ? obj?.zimbraPrefCalendarApptVisibility : ''
				);
				setValue(
					'zimbraPrefCalendarDefaultApptDuration',
					obj?.zimbraPrefCalendarDefaultApptDuration
						? obj?.zimbraPrefCalendarDefaultApptDuration
						: ''
				);
				setValue(
					'zimbraPrefCalendarApptReminderWarningTime',
					obj?.zimbraPrefCalendarApptReminderWarningTime
						? obj?.zimbraPrefCalendarApptReminderWarningTime
						: ''
				);
				setValue(
					'zimbraPrefCalendarShowPastDueReminders',
					obj?.zimbraPrefCalendarShowPastDueReminders
						? obj?.zimbraPrefCalendarShowPastDueReminders
						: 'FALSE'
				);
				/* setValue(
					'zimbraPrefCalendarToasterEnabled',
					obj?.zimbraPrefCalendarToasterEnabled ? obj?.zimbraPrefCalendarToasterEnabled : 'FALSE'
				); */
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
				/* setValue(
					'zimbraPrefCalendarReminderSoundsEnabled',
					obj?.zimbraPrefCalendarReminderSoundsEnabled
						? obj?.zimbraPrefCalendarReminderSoundsEnabled
						: 'FALSE'
				); */
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
				/* setValue(
					'zimbraPrefCalendarUseQuickAdd',
					obj?.zimbraPrefCalendarUseQuickAdd ? obj?.zimbraPrefCalendarUseQuickAdd : 'FALSE'
				); */
				setValue(
					'zimbraPrefAppleIcalDelegationEnabled',
					obj?.zimbraPrefAppleIcalDelegationEnabled
						? obj?.zimbraPrefAppleIcalDelegationEnabled
						: 'FALSE'
				);
				/* setValue(
					'zimbraPrefUseTimeZoneListInCalendar',
					obj?.zimbraPrefUseTimeZoneListInCalendar
						? obj?.zimbraPrefUseTimeZoneListInCalendar
						: 'FALSE'
				); */
			}
		},
		[setValue]
	);

	useEffect(() => {
		if (!!cosInformation && cosInformation.length > 0) {
			const obj: any = {};
			cosInformation.forEach((item: any) => {
				obj[item?.n] = item._content;
			});
			if (!obj.zimbraPrefMessageViewHtmlPreferred) {
				obj.zimbraPrefMessageViewHtmlPreferred = 'FALSE';
			}
			if (!obj.zimbraPrefLocale) {
				obj.zimbraPrefLocale = '';
			}
			if (!obj.zimbraPrefGroupMailBy) {
				obj.zimbraPrefGroupMailBy = '';
			}
			if (!obj.zimbraPrefMailDefaultCharset) {
				obj.zimbraPrefMailDefaultCharset = '';
			}
			if (!obj.zimbraPrefMessageIdDedupingEnabled) {
				obj.zimbraPrefMessageIdDedupingEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefMailToasterEnabled) {
				obj.zimbraPrefMailToasterEnabled = 'FALSE';
			}
			if (!obj.zimbraPrefMailPollingInterval) {
				obj.zimbraPrefMailPollingInterval = '';
			}
			if (!obj.zimbraMailMinPollingInterval) {
				obj.zimbraMailMinPollingInterval = '';
				obj.zimbraMailMinPollingIntervalType = {};
			}
			if (!obj.zimbraPrefMailSendReadReceipts) {
				obj.zimbraPrefMailSendReadReceipts = '';
			}
			if (!obj.zimbraPrefSaveToSent) {
				obj.zimbraPrefSaveToSent = 'FALSE';
			}
			if (!obj.zimbraFeatureMailForwardingInFiltersEnabled) {
				obj.zimbraFeatureMailForwardingInFiltersEnabled = 'FALSE';
			}
			if (!obj.zimbraFeatureMailForwardingEnabled) {
				obj.zimbraFeatureMailForwardingEnabled = 'FALSE';
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
				obj.zimbraPrefCalendarFirstDayOfWeek = '';
			}
			if (!obj.zimbraPrefTimeZoneId) {
				obj.zimbraPrefTimeZoneId = '';
			}
			if (!obj.zimbraPrefCalendarInitialView) {
				obj.zimbraPrefCalendarInitialView = '';
			}
			if (!obj.zimbraPrefCalendarApptVisibility) {
				obj.zimbraPrefCalendarApptVisibility = '';
			}
			if (!obj.zimbraPrefCalendarDefaultApptDuration) {
				obj.zimbraPrefCalendarDefaultApptDuration = '';
			}
			if (!obj.zimbraPrefCalendarApptReminderWarningTime) {
				obj.zimbraPrefCalendarApptReminderWarningTime = '';
			}
			if (!obj.zimbraPrefCalendarShowPastDueReminders) {
				obj.zimbraPrefCalendarShowPastDueReminders = 'FALSE';
			}
			/* if (!obj.zimbraPrefCalendarToasterEnabled) {
				obj.zimbraPrefCalendarToasterEnabled = 'FALSE';
			} */
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
			/* if (!obj.zimbraPrefCalendarReminderSoundsEnabled) {
				obj.zimbraPrefCalendarReminderSoundsEnabled = 'FALSE';
			} */
			if (!obj.zimbraPrefCalendarSendInviteDeniedAutoReply) {
				obj.zimbraPrefCalendarSendInviteDeniedAutoReply = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarNotifyDelegatedChanges) {
				obj.zimbraPrefCalendarNotifyDelegatedChanges = 'FALSE';
			}
			/* if (!obj.zimbraPrefCalendarUseQuickAdd) {
				obj.zimbraPrefCalendarUseQuickAdd = 'FALSE';
			} */
			if (!obj.zimbraPrefAppleIcalDelegationEnabled) {
				obj.zimbraPrefAppleIcalDelegationEnabled = 'FALSE';
			}
			/* if (!obj.zimbraPrefUseTimeZoneListInCalendar) {
				obj.zimbraPrefUseTimeZoneListInCalendar = 'FALSE';
			} */
			setCosData(obj);
			setInitalValues(obj);
			setZimbraPrefMailPollingIntervalNum(obj?.zimbraMailMinPollingInterval?.slice(0, -1));
			setPrefMailPollingIntervalType(obj?.zimbraMailMinPollingInterval?.slice(-1));
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
			cosData.zimbraPrefLocale !== undefined &&
			!isEqual(cosData.zimbraPrefLocale, cosPreferences.zimbraPrefLocale)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefLocale, cosPreferences.zimbraPrefLocale]);

	useEffect(() => {
		if (
			cosData.zimbraPrefGroupMailBy !== undefined &&
			!isEqual(cosData.zimbraPrefGroupMailBy, cosPreferences.zimbraPrefGroupMailBy)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefGroupMailBy, cosPreferences.zimbraPrefGroupMailBy]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailDefaultCharset !== undefined &&
			!isEqual(cosData.zimbraPrefMailDefaultCharset, cosPreferences.zimbraPrefMailDefaultCharset)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailDefaultCharset, cosPreferences.zimbraPrefMailDefaultCharset]);

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
			!isEqual(cosData.zimbraPrefMailPollingInterval, cosPreferences.zimbraPrefMailPollingInterval)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailPollingInterval, cosPreferences.zimbraPrefMailPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraMailMinPollingInterval !== undefined &&
			cosData.zimbraMailMinPollingInterval !== cosPreferences.zimbraMailMinPollingInterval
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraMailMinPollingInterval, cosPreferences.zimbraMailMinPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailSendReadReceipts !== undefined &&
			!isEqual(
				cosData.zimbraPrefMailSendReadReceipts,
				cosPreferences.zimbraPrefMailSendReadReceipts
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailSendReadReceipts, cosPreferences.zimbraPrefMailSendReadReceipts]);

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
			cosData.zimbraFeatureMailForwardingEnabled !== undefined &&
			cosData.zimbraFeatureMailForwardingEnabled !==
				cosPreferences.zimbraFeatureMailForwardingEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraFeatureMailForwardingEnabled,
		cosPreferences.zimbraFeatureMailForwardingEnabled
	]);
	useEffect(() => {
		if (
			cosData.zimbraFeatureMailForwardingInFiltersEnabled !== undefined &&
			cosData.zimbraFeatureMailForwardingInFiltersEnabled !==
				cosPreferences.zimbraFeatureMailForwardingInFiltersEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraFeatureMailForwardingInFiltersEnabled,
		cosPreferences.zimbraFeatureMailForwardingInFiltersEnabled
	]);

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
			!isEqual(
				cosData.zimbraPrefCalendarFirstDayOfWeek,
				cosPreferences.zimbraPrefCalendarFirstDayOfWeek
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarFirstDayOfWeek, cosPreferences.zimbraPrefCalendarFirstDayOfWeek]);

	useEffect(() => {
		if (
			cosData.zimbraPrefTimeZoneId !== undefined &&
			!isEqual(cosData.zimbraPrefTimeZoneId, cosPreferences.zimbraPrefTimeZoneId)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefTimeZoneId, cosPreferences.zimbraPrefTimeZoneId]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarInitialView !== undefined &&
			!isEqual(cosData.zimbraPrefCalendarInitialView, cosPreferences.zimbraPrefCalendarInitialView)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarInitialView, cosPreferences.zimbraPrefCalendarInitialView]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptVisibility !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarApptVisibility,
				cosPreferences.zimbraPrefCalendarApptVisibility
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarApptVisibility, cosPreferences.zimbraPrefCalendarApptVisibility]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarDefaultApptDuration !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarDefaultApptDuration,
				cosPreferences.zimbraPrefCalendarDefaultApptDuration
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarDefaultApptDuration,
		cosPreferences.zimbraPrefCalendarDefaultApptDuration
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptReminderWarningTime !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarApptReminderWarningTime,
				cosPreferences.zimbraPrefCalendarApptReminderWarningTime
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarApptReminderWarningTime,
		cosPreferences.zimbraPrefCalendarApptReminderWarningTime
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

	/* useEffect(() => {
		if (
			cosData.zimbraPrefCalendarToasterEnabled !== undefined &&
			cosData.zimbraPrefCalendarToasterEnabled !== cosPreferences.zimbraPrefCalendarToasterEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarToasterEnabled, cosPreferences.zimbraPrefCalendarToasterEnabled]); */

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

	/* useEffect(() => {
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
	]); */

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

	/* useEffect(() => {
		if (
			cosData.zimbraPrefCalendarUseQuickAdd !== undefined &&
			cosData.zimbraPrefCalendarUseQuickAdd !== cosPreferences.zimbraPrefCalendarUseQuickAdd
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarUseQuickAdd, cosPreferences.zimbraPrefCalendarUseQuickAdd]); */

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

	/* useEffect(() => {
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
	]); */

	const onCancel = (): void => {
		setInitalValues(cosData);
		setZimbraPrefMailPollingIntervalNum(cosData?.zimbraMailMinPollingInterval?.slice(0, -1));
		setPrefMailPollingIntervalType(cosData?.zimbraMailMinPollingInterval?.slice(-1));
		setIsDirty(false);
	};

	const onSave = (): void => {
		const body: any = {};
		body._jsns = 'urn:zimbraAdmin';
		const attributes: any[] = [];
		const id = {
			_content: cosData.zimbraId
		};
		body.id = id;
		Object.keys(cosPreferences).forEach((ele: any) =>
			attributes.push({ n: ele, _content: cosPreferences[ele] })
		);
		body.a = attributes;
		modifyCos(body)
			.then((data) => {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.change_save_success_msg', 'The change has been saved successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				const cos: any = data?.cos[0];
				if (cos) {
					setCos(cos);
				}
				setIsDirty(false);
			})
			.catch((error) => {
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
	};

	return (
		<Container mainAlignment="flex-start" background="gray6" padding={{ all: 'large' }}>
			<Row mainAlignment="flex-start" width="100%">
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
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
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
				padding={{ top: 'large' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.general_options', 'General Options')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container>
									<Select
										items={localeZone}
										background="gray5"
										label={t('label.language', 'Language')}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefLocale === ''
												? localeZone[-1]
												: localeZone.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === cosPreferences?.zimbraPrefLocale
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onPrefLocaleChange}
										disabled={readonlyCOS}
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
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
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
								iconColor="primary"
								disabled={readonlyCOS}
							/>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										selection={
											cosPreferences?.zimbraPrefGroupMailBy === ''
												? GROUP_BY[-1]
												: GROUP_BY.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === cosPreferences?.zimbraPrefGroupMailBy
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onGroupByChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										background="gray5"
										label={t('cos.default_charset', 'Default Charset')}
										showCheckbox={false}
										items={CHARACTOR_SET}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										selection={
											cosPreferences?.zimbraPrefMailDefaultCharset === ''
												? CHARACTOR_SET[-1]
												: CHARACTOR_SET.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPreferences?.zimbraPrefMailDefaultCharset
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onCharactorSetChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										iconColor="primary"
										disabled={readonlyCOS}
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
										iconColor="primary"
										disabled={readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										label={t('cos.minimum_mail_polling_interval', 'Minimum mail polling interval')}
										backgroundColor="gray5"
										value={zimbraPrefMailPollingIntervalNum}
										type="number"
										onChange={onPrefMailPollingIntervalNumChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={TIME_TYPES}
										background="gray5"
										label={t('cos.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
										showCheckbox={false}
										selection={
											prefMailPollingIntervalType === ''
												? TIME_TYPES[-1]
												: TIME_TYPES.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === prefMailPollingIntervalType
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onPrefMailPollingIntervalTypeChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="center" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Select
										items={POLLING_INTERVAL}
										background="gray5"
										label={t('cos.polling_interval', 'Polling interval')}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefMailPollingInterval === ''
												? POLLING_INTERVAL[-1]
												: POLLING_INTERVAL.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPreferences?.zimbraPrefMailPollingInterval
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onPollingIntervalChange}
										disabled={readonlyCOS}
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
						{t('label.forwarding', 'Forwarding')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraFeatureMailForwardingEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraFeatureMailForwardingEnabled')}
										label={t(
											'cos.user_can_specify_forwarding_address',
											`User can specify forwarding address`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraFeatureMailForwardingInFiltersEnabled === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraFeatureMailForwardingInFiltersEnabled')
										}
										label={t(
											'cos.user_can_specify_mail_forwarding_filter',
											'User can specify mail forwarding filter'
										)}
										iconColor="primary"
										disabled={readonlyCOS}
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
						{t('label.sending_mails', 'Sending Mails')}
					</Text>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'large', bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Switch
										value={cosPreferences?.zimbraPrefSaveToSent === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefSaveToSent')}
										label={t('cos.save_to_Sent', `Save to sent`)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ bottom: 'large' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start">
									<Switch
										value={cosPreferences?.zimbraAllowAnyFromAddress === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
										label={t(
											'cos.allow_sending_from_any_address',
											'Allow sending from any address'
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ bottom: 'large' }}
						>
							<ListRow>
								<Container>
									<Select
										items={SEND_READ_RECEIPTS}
										background="gray5"
										label={t('cos.read_receipt_settings', 'Read Receipt settings')}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefMailSendReadReceipts === ''
												? SEND_READ_RECEIPTS[-1]
												: SEND_READ_RECEIPTS.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPreferences?.zimbraPrefMailSendReadReceipts
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onMailSendReadReceipts}
										disabled={readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
										label={t('cos.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
										iconColor="primary"
										disabled={readonlyCOS}
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
					<Row mainAlignment="flex-start" width="100%">
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
										selection={
											cosPreferences?.zimbraPrefTimeZoneId === ''
												? timezones[-1]
												: timezones.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === cosPreferences?.zimbraPrefTimeZoneId
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onPrefTimeZoneChange}
										disabled={readonlyCOS}
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
										selection={
											cosPreferences?.zimbraPrefCalendarDefaultApptDuration === ''
												? DEFAULT_APPOINTMENT_DURATION[-1]
												: DEFAULT_APPOINTMENT_DURATION.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPreferences?.zimbraPrefCalendarDefaultApptDuration
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onCalendarDefaultApptDurationChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										label={t(
											'label.appointment_reminder_in_minutes',
											'Appointment Reminder in minutes'
										)}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefCalendarApptReminderWarningTime === ''
												? APPOINTMENT_REMINDER[-1]
												: APPOINTMENT_REMINDER.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value ===
															cosPreferences?.zimbraPrefCalendarApptReminderWarningTime
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onReminderWarningTimeChange}
										disabled={readonlyCOS}
									/>
								</Container>
								<Container padding={{ left: 'small' }}>
									<Select
										items={DefaultViewOptions}
										background="gray5"
										label={t('label.default_calendar_view', 'Default Calendar View')}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefCalendarInitialView === ''
												? DefaultViewOptions[-1]
												: DefaultViewOptions.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPreferences?.zimbraPrefCalendarInitialView
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onCalendarInitialViewChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										label={t('label.the_week_starts_on', 'The Week starts on')}
										showCheckbox={false}
										selection={
											cosPreferences?.zimbraPrefCalendarFirstDayOfWeek === ''
												? FIRST_DAY_OF_WEEK[-1]
												: FIRST_DAY_OF_WEEK.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPreferences?.zimbraPrefCalendarFirstDayOfWeek
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onFirstDayOfWeekChange}
										disabled={readonlyCOS}
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
										selection={
											cosPreferences?.zimbraPrefCalendarApptVisibility === ''
												? APPOINTMENT_VISIBILITY[-1]
												: APPOINTMENT_VISIBILITY.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPreferences?.zimbraPrefCalendarApptVisibility
												  )
										}
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore // Need to fix it with custom soultion
										onChange={onAppointmentVisibilityChange}
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										label={t(
											'cos.enable_past_due_reminders',
											`Enable reminders of appointments in the past`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
										onClick={(): void =>
											changeSwitchOption('zimbraPrefCalendarAllowCancelEmailToSelf')
										}
										label={t(
											'cos.allow_sending_cancellation_mail',
											`Allow sending cancellation mail`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
											`Automatically add forwarded appointments to the calendar`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
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
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
										label={t(
											'cos.add_appointments_when_invited',
											`Automatically add appointments when the user is invited`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
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
											'Auto-decline if the sender is blacklisted'
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
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
											`Notify changes made by delegated accounts`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPreferences?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefAppleIcalDelegationEnabled')}
										label={t(
											'cos.use_ical_delegation_model_for_shared_calendars',
											`Use iCal delegation model for shared calendars`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Row>
			</Container>
		</Container>
	);
};

export default CosPreferences;
