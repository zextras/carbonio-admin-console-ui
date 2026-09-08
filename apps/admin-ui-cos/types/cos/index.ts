/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Attribute } from '../attribute';

export type CosEdition = 'mail' | 'workspace';

export type Cos = {
  id?: string;
  name?: string;
  isDefaultCos?: boolean;
  a?: Array<Attribute>;
};

export type CosPrefAttributes = {
  zimbraPrefLocale: string;
  zimbraPrefMessageViewHtmlPreferred: string;
  zimbraPrefGroupMailBy: string;
  zimbraPrefMailDefaultCharset: string;
  zimbraPrefMessageIdDedupingEnabled: string;
  zimbraPrefMailToasterEnabled: string;
  zimbraPrefMailPollingInterval: string;
  zimbraMailMinPollingInterval: string;
  zimbraPrefMailSendReadReceipts: string;
  zimbraFeatureReadReceiptsEnabled: string;
  zimbraPrefSaveToSent: string;
  zimbraFeatureMailForwardingEnabled: string;
  zimbraFeatureMailForwardingInFiltersEnabled: string;
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
};

export type CosAttributes = CosPrefAttributes & {
  zimbraId: string;
};

export type CosResponse = {
  cos: Array<Cos>;
};

export type SearchDirectoryEntry = {
  id: string;
  name: string;
  a: Array<Attribute>;
};

export type SearchDirectoryResponse = {
  cos?: Array<SearchDirectoryEntry>;
  account?: Array<SearchDirectoryEntry>;
  dl?: Array<SearchDirectoryEntry>;
  domain?: Array<SearchDirectoryEntry>;
  more?: boolean;
  searchTotal?: number;
};
