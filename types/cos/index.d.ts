/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../attribute';

export type Cos = {
	id?: string;
	name?: string;
	isDefaultCos?: boolean;
	a?: Array<Attribute>;
};

export interface CosPrefAttributes {
	zimbraPrefLocale: string;
	zimbraPrefMessageViewHtmlPreferred: string;
	zimbraPrefGroupMailBy: string;
	zimbraPrefMailDefaultCharset: string;
	zimbraPrefMessageIdDedupingEnabled: string;
	zimbraPrefMailToasterEnabled: string;
	zimbraPrefMailPollingInterval: string;
	zimbraMailMinPollingInterval: string;
	zimbraPrefMailSendReadReceipts: string;
	zimbraPrefSaveToSent: string;
	zimbraFeatureMailForwardingEnabled: string;
	zimbraFeatureMailForwardingInFiltersEnabled: string;
	zimbraAllowAnyFromAddress: string;
	zimbraPrefAutoAddAddressEnabled: string;
	zimbraPrefGalAutoCompleteEnabled: string;
	zimbraPrefCalendarFirstDayOfWeek: string;
	zimbraPrefTimeZoneId: string;
	zimbraPrefCalendarInitialView: string;
	zimbraPrefCalendarApptVisibility: string;
	zimbraPrefCalendarDefaultApptDuration: string;
	zimbraPrefCalendarApptReminderWarningTime: string;
	zimbraPrefCalendarShowPastDueReminders: string;
	zimbraPrefCalendarAllowCancelEmailToSelf: string;
	zimbraPrefCalendarAllowPublishMethodInvite: string;
	zimbraPrefCalendarAllowForwardedInvite: string;
	zimbraPrefCalendarAutoAddInvites: string;
	zimbraPrefCalendarSendInviteDeniedAutoReply: string;
	zimbraPrefCalendarNotifyDelegatedChanges: string;
	zimbraPrefAppleIcalDelegationEnabled: string;
	zimbraFileUploadMaxSizePerFile: string;
}

export interface CosAttributes extends CosPrefAttributes {
	zimbraId: string;
}
