/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CosPrefAttributes } from '../../../../types/cos';

export const DEFAULT_COS_PREF_ATTRIBUTES: CosPrefAttributes = {
	zimbraPrefMessageViewHtmlPreferred: 'FALSE',
	zimbraPrefLocale: '',
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
	zimbraFileUploadMaxSizePerFile: '2147483648'
};
