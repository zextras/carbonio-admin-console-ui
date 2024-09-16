/* eslint-disable */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Button,
	Container,
	Divider,
	Input,
	Padding,
	Row,
	Select,
	Switch,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { find, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../types/cos';
import { COS } from '../../constants';
import { flushCache } from '../../services/flush-cache-service';
import { modifyCos } from '../../services/modify-cos-service';
import { useCosStore } from '../../store/cos/store';
import { Right, Rights, useRightsStore } from '../../store/rights/store';
import ListRow from '../list/list-row';
import {
	appointmentReminder,
	bytesToHumanReadable,
	charactorSet,
	conversationGroupBy,
	localeList,
	timeZoneList
} from '../utility/utils';

const FILE_UPLOAD_MAX_SIZE_PER_FILE = '2147483648';

function bytesToHumanFriendlyFileUploadMaxSizePerFile(
	bytes: string | number,
	t: TFunction
): string {
	const parsedBytes = typeof bytes === 'string' ? Number(bytes) : bytes;
	if (!parsedBytes) {
		return bytesToHumanReadable(0);
	}
	if (parsedBytes < 1) {
		return t('cos.unlimited', 'Unlimited');
	}
	return `~${bytesToHumanReadable(parsedBytes)}`;
}

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const cosInformation = useCosStore((state) => state.cos?.a);
	const [cosData, setCosData]: any = useState({});
	const setCos = useCosStore((state) => state.setCos);
	const localeZone: any = useMemo(() => localeList(t), [t]);
	const rights: Rights = useRightsStore((state) => state.rights);

	const readonlyCOS = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: COS }) || { all: [], type: COS };
		return !rightsConfig?.all?.[0]?.setAttrs?.[0]?.all;
	}, [rights]);

	const [cosPrefAttributes, setCosPrefAttributes] = useState<CosPrefAttributes>({
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
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE',
		zimbraFileUploadMaxSizePerFile: FILE_UPLOAD_MAX_SIZE_PER_FILE
	});

	const [
		humanFriendlyFileUploadMaxSizePerFileLabel,
		setHumanFriendlyFileUploadMaxSizePerFileLabel
	] = useState(
		bytesToHumanFriendlyFileUploadMaxSizePerFile(
			cosPrefAttributes.zimbraFileUploadMaxSizePerFile,
			t
		)
	);

	const [zimbraPrefMailPollingIntervalNum, setZimbraPrefMailPollingIntervalNum] = useState(
		cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(0, -1) || ''
	);
	const [prefMailPollingIntervalType, setPrefMailPollingIntervalType] = useState(
		cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(-1) || ''
	);
	const GROUP_BY: any = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET: any = useMemo(() => charactorSet(), []);
	const timezones: any = useMemo(() => timeZoneList(t), [t]);
	const APPOINTMENT_REMINDER: any = useMemo(() => appointmentReminder(t), [t]);

	const TIME_TYPES: any = useMemo(
		() => [
			{ label: `${t('label.days', 'Days')}`, value: 'd' },
			{ label: `${t('label.hours', 'Hours')}`, value: 'h' },
			// eslint-disable-next-line sonarjs/no-duplicate-string
			{ label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
			{ label: `${t('label.seconds', 'Seconds')}`, value: 's' }
		],
		[t]
	);

	const DefaultViewOptions: any = useMemo(
		() => [
			{ label: t('cos.default_view.month', 'Month View'), value: 'month' },
			{ label: t('cos.default_view.week', 'Week View'), value: 'week' },
			{ label: t('cos.default_view.day', 'Day View'), value: 'day' },
			{ label: t('cos.default_view.work_week', 'Work Week View'), value: 'workWeek' },
			{ label: t('cos.default_view.list', 'List View'), value: 'list' }
		],
		[t]
	);
	const APPOINTMENT_VISIBILITY: any = useMemo(
		() => [
			{ label: t('label.public', 'Public'), value: 'public' },
			{ label: t('label.private', 'Private'), value: 'private' }
		],
		[t]
	);
	const FIRST_DAY_OF_WEEK: any = useMemo(
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

	const DEFAULT_APPOINTMENT_DURATION: any = useMemo(
		() => [
			{ label: `30 ${t('label.minutes', 'minutes')}`, value: '30m' },
			{ label: `60 ${t('label.minutes', 'minutes')}`, value: '60m' },
			{ label: `90 ${t('label.minutes', 'minutes')}`, value: '90m' },
			{ label: `120 ${t('label.minutes', 'minutes')}`, value: '120m' }
		],
		[t]
	);

	const SEND_READ_RECEIPTS: any = useMemo(
		() => [
			{ label: t('label.never_send_read_receipt', 'Never send a read receipt'), value: 'never' },
			{ label: t('label.always_send_read_receipt', 'Always send a read receipt'), value: 'always' },
			{ label: t('label.ask_me', 'Ask me'), value: 'prompt' }
		],
		[t]
	);

	const POLLING_INTERVAL: any = useMemo(
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

	const changeFileUploadMaxSizePerFile = useCallback(
		(value): void => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraFileUploadMaxSizePerFile: value
			}));
			setHumanFriendlyFileUploadMaxSizePerFileLabel(
				bytesToHumanFriendlyFileUploadMaxSizePerFile(value, t)
			);
		},
		[setCosPrefAttributes, t]
	);

	const changeSwitchOption = useCallback(
		(key: any): void => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				[key]: key === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[setCosPrefAttributes]
	);

	const onGroupByChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefGroupMailBy: v }));
		},
		[setCosPrefAttributes]
	);

	const onCharactorSetChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefMailDefaultCharset: v }));
		},
		[setCosPrefAttributes]
	);

	const onPrefLocaleChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefLocale: v }));
		},
		[setCosPrefAttributes]
	);

	const onPollingIntervalChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefMailPollingInterval: v }));
		},
		[setCosPrefAttributes]
	);

	const onPrefMailPollingIntervalTypeChange = useCallback(
		(v) => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraMailMinPollingInterval: zimbraPrefMailPollingIntervalNum
					? `${zimbraPrefMailPollingIntervalNum}${v}`
					: ''
			}));
		},
		[zimbraPrefMailPollingIntervalNum, setCosPrefAttributes]
	);
	const onPrefMailPollingIntervalNumChange = useCallback(
		(e) => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraMailMinPollingInterval: e.target.value
					? `${e.target.value}${prefMailPollingIntervalType}`
					: ''
			}));
			setZimbraPrefMailPollingIntervalNum(e.target.value);
		},
		[setCosPrefAttributes, prefMailPollingIntervalType]
	);

	const onMailSendReadReceipts = useCallback(
		(v) => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraPrefMailSendReadReceipts: v
			}));
		},
		[setCosPrefAttributes]
	);

	const onPrefTimeZoneChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefTimeZoneId: v }));
		},
		[setCosPrefAttributes]
	);

	const onCalendarDefaultApptDurationChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraPrefCalendarDefaultApptDuration: v
			}));
		},
		[setCosPrefAttributes]
	);

	const onReminderWarningTimeChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({
				...prev,
				zimbraPrefCalendarApptReminderWarningTime: v
			}));
		},
		[setCosPrefAttributes]
	);

	const onCalendarInitialViewChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefCalendarInitialView: v }));
		},
		[setCosPrefAttributes]
	);

	const onFirstDayOfWeekChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefCalendarFirstDayOfWeek: v }));
		},
		[setCosPrefAttributes]
	);

	const onAppointmentVisibilityChange = useCallback(
		(v): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, zimbraPrefCalendarApptVisibility: v }));
		},
		[setCosPrefAttributes]
	);

	const setValue = useCallback(
		(key: string, value: any): void => {
			setCosPrefAttributes((prev: any) => ({ ...prev, [key]: value }));
		},
		[setCosPrefAttributes]
	);

	const setInitalValues = useCallback(
		(obj: CosPrefAttributes): void => {
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
					'zimbraPrefAppleIcalDelegationEnabled',
					obj?.zimbraPrefAppleIcalDelegationEnabled
						? obj?.zimbraPrefAppleIcalDelegationEnabled
						: 'FALSE'
				);
				setValue(
					'zimbraFileUploadMaxSizePerFile',
					obj?.zimbraFileUploadMaxSizePerFile
						? obj.zimbraFileUploadMaxSizePerFile
						: FILE_UPLOAD_MAX_SIZE_PER_FILE
				);
			}
		},
		[setValue]
	);

	useEffect(() => {
		setHumanFriendlyFileUploadMaxSizePerFileLabel(
			bytesToHumanFriendlyFileUploadMaxSizePerFile(
				cosPrefAttributes.zimbraFileUploadMaxSizePerFile,
				t
			)
		);
	}, [cosPrefAttributes.zimbraFileUploadMaxSizePerFile, t]);

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

			if (!obj.zimbraPrefCalendarSendInviteDeniedAutoReply) {
				obj.zimbraPrefCalendarSendInviteDeniedAutoReply = 'FALSE';
			}
			if (!obj.zimbraPrefCalendarNotifyDelegatedChanges) {
				obj.zimbraPrefCalendarNotifyDelegatedChanges = 'FALSE';
			}
			if (!obj.zimbraPrefAppleIcalDelegationEnabled) {
				obj.zimbraPrefAppleIcalDelegationEnabled = 'FALSE';
			}
			if (!obj.zimbraFileUploadMaxSizePerFile) {
				obj.zimbraFileUploadMaxSizePerFile = FILE_UPLOAD_MAX_SIZE_PER_FILE;
			}
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
				cosPrefAttributes.zimbraPrefMessageViewHtmlPreferred
		) {
			setIsDirty(true);
		}
	}, [
		cosPrefAttributes.zimbraPrefMessageViewHtmlPreferred,
		cosData.zimbraPrefMessageViewHtmlPreferred
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefLocale !== undefined &&
			!isEqual(cosData.zimbraPrefLocale, cosPrefAttributes.zimbraPrefLocale)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefLocale, cosPrefAttributes.zimbraPrefLocale]);

	useEffect(() => {
		if (
			cosData.zimbraPrefGroupMailBy !== undefined &&
			!isEqual(cosData.zimbraPrefGroupMailBy, cosPrefAttributes.zimbraPrefGroupMailBy)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefGroupMailBy, cosPrefAttributes.zimbraPrefGroupMailBy]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailDefaultCharset !== undefined &&
			!isEqual(cosData.zimbraPrefMailDefaultCharset, cosPrefAttributes.zimbraPrefMailDefaultCharset)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailDefaultCharset, cosPrefAttributes.zimbraPrefMailDefaultCharset]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMessageIdDedupingEnabled !== undefined &&
			cosData.zimbraPrefMessageIdDedupingEnabled !==
				cosPrefAttributes.zimbraPrefMessageIdDedupingEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefMessageIdDedupingEnabled,
		cosPrefAttributes.zimbraPrefMessageIdDedupingEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailToasterEnabled !== undefined &&
			cosData.zimbraPrefMailToasterEnabled !== cosPrefAttributes.zimbraPrefMailToasterEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailToasterEnabled, cosPrefAttributes.zimbraPrefMailToasterEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailPollingInterval !== undefined &&
			!isEqual(
				cosData.zimbraPrefMailPollingInterval,
				cosPrefAttributes.zimbraPrefMailPollingInterval
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailPollingInterval, cosPrefAttributes.zimbraPrefMailPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraMailMinPollingInterval !== undefined &&
			cosData.zimbraMailMinPollingInterval !== cosPrefAttributes.zimbraMailMinPollingInterval
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraMailMinPollingInterval, cosPrefAttributes.zimbraMailMinPollingInterval]);

	useEffect(() => {
		if (
			cosData.zimbraPrefMailSendReadReceipts !== undefined &&
			!isEqual(
				cosData.zimbraPrefMailSendReadReceipts,
				cosPrefAttributes.zimbraPrefMailSendReadReceipts
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefMailSendReadReceipts, cosPrefAttributes.zimbraPrefMailSendReadReceipts]);

	useEffect(() => {
		if (
			cosData.zimbraPrefSaveToSent !== undefined &&
			cosData.zimbraPrefSaveToSent !== cosPrefAttributes.zimbraPrefSaveToSent
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefSaveToSent, cosPrefAttributes.zimbraPrefSaveToSent]);

	useEffect(() => {
		if (
			cosData.zimbraFeatureMailForwardingEnabled !== undefined &&
			cosData.zimbraFeatureMailForwardingEnabled !==
				cosPrefAttributes.zimbraFeatureMailForwardingEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraFeatureMailForwardingEnabled,
		cosPrefAttributes.zimbraFeatureMailForwardingEnabled
	]);
	useEffect(() => {
		if (
			cosData.zimbraFeatureMailForwardingInFiltersEnabled !== undefined &&
			cosData.zimbraFeatureMailForwardingInFiltersEnabled !==
				cosPrefAttributes.zimbraFeatureMailForwardingInFiltersEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraFeatureMailForwardingInFiltersEnabled,
		cosPrefAttributes.zimbraFeatureMailForwardingInFiltersEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraAllowAnyFromAddress !== undefined &&
			cosData.zimbraAllowAnyFromAddress !== cosPrefAttributes.zimbraAllowAnyFromAddress
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraAllowAnyFromAddress, cosPrefAttributes.zimbraAllowAnyFromAddress]);

	useEffect(() => {
		if (
			cosData.zimbraPrefAutoAddAddressEnabled !== undefined &&
			cosData.zimbraPrefAutoAddAddressEnabled !== cosPrefAttributes.zimbraPrefAutoAddAddressEnabled
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefAutoAddAddressEnabled, cosPrefAttributes.zimbraPrefAutoAddAddressEnabled]);

	useEffect(() => {
		if (
			cosData.zimbraPrefGalAutoCompleteEnabled !== undefined &&
			cosData.zimbraPrefGalAutoCompleteEnabled !==
				cosPrefAttributes.zimbraPrefGalAutoCompleteEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefGalAutoCompleteEnabled,
		cosPrefAttributes.zimbraPrefGalAutoCompleteEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarFirstDayOfWeek !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarFirstDayOfWeek,
				cosPrefAttributes.zimbraPrefCalendarFirstDayOfWeek
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarFirstDayOfWeek,
		cosPrefAttributes.zimbraPrefCalendarFirstDayOfWeek
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefTimeZoneId !== undefined &&
			!isEqual(cosData.zimbraPrefTimeZoneId, cosPrefAttributes.zimbraPrefTimeZoneId)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefTimeZoneId, cosPrefAttributes.zimbraPrefTimeZoneId]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarInitialView !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarInitialView,
				cosPrefAttributes.zimbraPrefCalendarInitialView
			)
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraPrefCalendarInitialView, cosPrefAttributes.zimbraPrefCalendarInitialView]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptVisibility !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarApptVisibility,
				cosPrefAttributes.zimbraPrefCalendarApptVisibility
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarApptVisibility,
		cosPrefAttributes.zimbraPrefCalendarApptVisibility
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarDefaultApptDuration !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarDefaultApptDuration,
				cosPrefAttributes.zimbraPrefCalendarDefaultApptDuration
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarDefaultApptDuration,
		cosPrefAttributes.zimbraPrefCalendarDefaultApptDuration
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarApptReminderWarningTime !== undefined &&
			!isEqual(
				cosData.zimbraPrefCalendarApptReminderWarningTime,
				cosPrefAttributes.zimbraPrefCalendarApptReminderWarningTime
			)
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarApptReminderWarningTime,
		cosPrefAttributes.zimbraPrefCalendarApptReminderWarningTime
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarShowPastDueReminders !== undefined &&
			cosData.zimbraPrefCalendarShowPastDueReminders !==
				cosPrefAttributes.zimbraPrefCalendarShowPastDueReminders
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarShowPastDueReminders,
		cosPrefAttributes.zimbraPrefCalendarShowPastDueReminders
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowCancelEmailToSelf !== undefined &&
			cosData.zimbraPrefCalendarAllowCancelEmailToSelf !==
				cosPrefAttributes.zimbraPrefCalendarAllowCancelEmailToSelf
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowCancelEmailToSelf,
		cosPrefAttributes.zimbraPrefCalendarAllowCancelEmailToSelf
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowPublishMethodInvite !== undefined &&
			cosData.zimbraPrefCalendarAllowPublishMethodInvite !==
				cosPrefAttributes.zimbraPrefCalendarAllowPublishMethodInvite
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowPublishMethodInvite,
		cosPrefAttributes.zimbraPrefCalendarAllowPublishMethodInvite
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAutoAddInvites !== undefined &&
			cosData.zimbraPrefCalendarAutoAddInvites !==
				cosPrefAttributes.zimbraPrefCalendarAutoAddInvites
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAutoAddInvites,
		cosPrefAttributes.zimbraPrefCalendarAutoAddInvites
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarAllowForwardedInvite !== undefined &&
			cosData.zimbraPrefCalendarAllowForwardedInvite !==
				cosPrefAttributes.zimbraPrefCalendarAllowForwardedInvite
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarAllowForwardedInvite,
		cosPrefAttributes.zimbraPrefCalendarAllowForwardedInvite
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarSendInviteDeniedAutoReply !== undefined &&
			cosData.zimbraPrefCalendarSendInviteDeniedAutoReply !==
				cosPrefAttributes.zimbraPrefCalendarSendInviteDeniedAutoReply
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarSendInviteDeniedAutoReply,
		cosPrefAttributes.zimbraPrefCalendarSendInviteDeniedAutoReply
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefCalendarNotifyDelegatedChanges !== undefined &&
			cosData.zimbraPrefCalendarNotifyDelegatedChanges !==
				cosPrefAttributes.zimbraPrefCalendarNotifyDelegatedChanges
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefCalendarNotifyDelegatedChanges,
		cosPrefAttributes.zimbraPrefCalendarNotifyDelegatedChanges
	]);

	useEffect(() => {
		if (
			cosData.zimbraPrefAppleIcalDelegationEnabled !== undefined &&
			cosData.zimbraPrefAppleIcalDelegationEnabled !==
				cosPrefAttributes.zimbraPrefAppleIcalDelegationEnabled
		) {
			setIsDirty(true);
		}
	}, [
		cosData.zimbraPrefAppleIcalDelegationEnabled,
		cosPrefAttributes.zimbraPrefAppleIcalDelegationEnabled
	]);

	useEffect(() => {
		if (
			cosData.zimbraFileUploadMaxSizePerFile !== undefined &&
			cosData.zimbraFileUploadMaxSizePerFile !== cosPrefAttributes.zimbraFileUploadMaxSizePerFile
		) {
			setIsDirty(true);
		}
	}, [cosData.zimbraFileUploadMaxSizePerFile, cosPrefAttributes.zimbraFileUploadMaxSizePerFile]);

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
		(Object.keys(cosPrefAttributes) as (keyof CosPrefAttributes)[]).forEach((ele) =>
			attributes.push({ n: ele, _content: cosPrefAttributes[ele] })
		);
		body.a = attributes;
		modifyCos(body)
			.then((data) => {
				flushCache('cos', 'id', body.id._content);
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
											cosPrefAttributes?.zimbraPrefLocale === ''
												? localeZone[-1]
												: localeZone.find(
														(item: any) => item.value === cosPrefAttributes?.zimbraPrefLocale
												  )
										}
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
								value={cosPrefAttributes?.zimbraPrefMessageViewHtmlPreferred === 'TRUE'}
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
										selection={
											cosPrefAttributes?.zimbraPrefGroupMailBy === ''
												? GROUP_BY[-1]
												: GROUP_BY.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === cosPrefAttributes?.zimbraPrefGroupMailBy
												  )
										}
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
										selection={
											cosPrefAttributes?.zimbraPrefMailDefaultCharset === ''
												? CHARACTOR_SET[-1]
												: CHARACTOR_SET.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPrefAttributes?.zimbraPrefMailDefaultCharset
												  )
										}
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
										value={cosPrefAttributes?.zimbraPrefMessageIdDedupingEnabled === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefMailToasterEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefMailToasterEnabled')}
										label={t(
											'cos.enable_new_mail_toast_notification',
											`Enable New Mail Toast Notification`
										)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" width="50%">
							<Row mainAlignment="flex-start" width="100%">
								<Container width="75%" crossAlignment="flex-start">
									<Input
										type="number"
										label={t(
											'cos.upload_max_size_per_file',
											'Maximum size (bytes) allowed for each attachment'
										)}
										value={cosPrefAttributes?.zimbraFileUploadMaxSizePerFile}
										backgroundColor="gray5"
										disabled={readonlyCOS}
										onKeyDown={(e): void => {
											if (
												![
													'Backspace',
													'Delete',
													'ArrowLeft',
													'ArrowRight',
													'0',
													'1',
													'2',
													'3',
													'4',
													'5',
													'6',
													'7',
													'8',
													'9'
												].includes(e.key)
											) {
												e.preventDefault();
											}
										}}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											const value = Number(e.target.value);
											if (value < 0) {
												changeFileUploadMaxSizePerFile(0);
											} else {
												changeFileUploadMaxSizePerFile(e.target.value.toString());
											}
										}}
									/>
								</Container>
								<Container width="25%" crossAlignment="flex-start">
									<Padding left="small">
										<Text size="medium" color="gray1">
											{humanFriendlyFileUploadMaxSizePerFileLabel}
										</Text>
									</Padding>
								</Container>
							</Row>
						</Container>
					</Row>
					<Row>
						<Padding vertical="large" />
						<Divider />
						<Padding vertical="large" />
					</Row>
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
											cosPrefAttributes?.zimbraPrefMailPollingInterval === ''
												? POLLING_INTERVAL[-1]
												: POLLING_INTERVAL.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPrefAttributes?.zimbraPrefMailPollingInterval
												  )
										}
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
										value={cosPrefAttributes?.zimbraFeatureMailForwardingEnabled === 'TRUE'}
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
										value={
											cosPrefAttributes?.zimbraFeatureMailForwardingInFiltersEnabled === 'TRUE'
										}
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
										value={cosPrefAttributes?.zimbraPrefSaveToSent === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraAllowAnyFromAddress === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
										label={t(
											'cos.allow_sending_from_any_address',
											'Allow sending from any address'
										)}
										iconColor="primary"
										disabled
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
											cosPrefAttributes?.zimbraPrefMailSendReadReceipts === ''
												? SEND_READ_RECEIPTS[-1]
												: SEND_READ_RECEIPTS.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPrefAttributes?.zimbraPrefMailSendReadReceipts
												  )
										}
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
										value={cosPrefAttributes?.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraPrefAutoAddAddressEnabled')}
										label={t('cos.enable_auto_add_contacts', `Enable auto-add contacts`)}
										iconColor="primary"
										disabled={readonlyCOS}
									/>
								</Container>
								<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
									<Switch
										value={cosPrefAttributes?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
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
											cosPrefAttributes?.zimbraPrefTimeZoneId === ''
												? timezones[-1]
												: timezones.find(
														// eslint-disable-next-line max-len
														(item: any) => item.value === cosPrefAttributes?.zimbraPrefTimeZoneId
												  )
										}
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
											cosPrefAttributes?.zimbraPrefCalendarDefaultApptDuration === ''
												? DEFAULT_APPOINTMENT_DURATION[-1]
												: DEFAULT_APPOINTMENT_DURATION.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value ===
															cosPrefAttributes?.zimbraPrefCalendarDefaultApptDuration
												  )
										}
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
											cosPrefAttributes?.zimbraPrefCalendarApptReminderWarningTime === ''
												? APPOINTMENT_REMINDER[-1]
												: APPOINTMENT_REMINDER.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value ===
															cosPrefAttributes?.zimbraPrefCalendarApptReminderWarningTime
												  )
										}
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
											cosPrefAttributes?.zimbraPrefCalendarInitialView === ''
												? DefaultViewOptions[-1]
												: DefaultViewOptions.find(
														// eslint-disable-next-line max-len
														(item: any) =>
															item.value === cosPrefAttributes?.zimbraPrefCalendarInitialView
												  )
										}
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
											cosPrefAttributes?.zimbraPrefCalendarFirstDayOfWeek === ''
												? FIRST_DAY_OF_WEEK[-1]
												: FIRST_DAY_OF_WEEK.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPrefAttributes?.zimbraPrefCalendarFirstDayOfWeek
												  )
										}
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
											cosPrefAttributes?.zimbraPrefCalendarApptVisibility === ''
												? APPOINTMENT_VISIBILITY[-1]
												: APPOINTMENT_VISIBILITY.find(
														(item: any) =>
															// eslint-disable-next-line max-len
															item.value === cosPrefAttributes?.zimbraPrefCalendarApptVisibility
												  )
										}
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
										value={cosPrefAttributes?.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefCalendarAllowCancelEmailToSelf === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefCalendarAllowForwardedInvite === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefCalendarAllowPublishMethodInvite === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
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
										value={
											cosPrefAttributes?.zimbraPrefCalendarSendInviteDeniedAutoReply === 'TRUE'
										}
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
										value={cosPrefAttributes?.zimbraPrefCalendarNotifyDelegatedChanges === 'TRUE'}
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
										value={cosPrefAttributes?.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
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
