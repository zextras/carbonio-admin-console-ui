/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAccountStore } from '@zextras/admin-ui-bootstrap/src/store/account/store';
import { createSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { page } from 'vitest/browser';

import { useCosStore } from '../../../../store/cos/store';
import { COSPreferences } from '../COSPreferences';

const mockApiResponse = {
	cos: [
		{
			name: 'default',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true,
			a: [
				{ n: 'cn', _content: 'firstCOS' },
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'objectClass', _content: 'zimbraCos' }
			]
		},
		{
			name: 'secondCOS',
			id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
			isDefaultCos: true,
			a: [
				{ n: 'cn', _content: 'secondCOS' },
				{ n: 'zimbraId', _content: 'f27456a8-0c00-11d9-280a-286d93afea2g' },
				{ n: 'objectClass', _content: 'zimbraCos' }
			]
		}
	],
	searchTotal: 2,
	more: false
};
const mockRightsData = [
	{
		type: 'cos',
		all: [
			{
				right: [
					{ n: 'assignCos' },
					{ n: 'deleteCos' },
					{ n: 'listCos' },
					{ n: 'manageZimlet' },
					{ n: 'renameCos' }
				],
				setAttrs: [{ all: true }],
				getAttrs: [{ all: true }]
			}
		]
	}
];

const getCosResponse = {
	cos: [
		{
			name: 'default',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true,
			a: []
		}
	],
	_jsns: 'urn:zimbraAdmin'
};
const getCosResponseLong = {
	cos: [
		{
			name: 'default',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true,
			a: [
				{
					n: 'zimbraPrefCalendarReminderMobile',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefIMLogChats',
					_content: 'TRUE'
				},
				{
					n: 'zimbraDeviceLockWhenInactive',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefFileSharingApplication',
					_content: 'briefcase'
				},
				{
					n: 'zimbraDataSourceTotalQuota',
					_content: '0'
				},
				{
					n: 'zimbraPrefCalendarWorkingHours',
					_content:
						'1:N:0800:1700,2:Y:0800:1700,3:Y:0800:1700,4:Y:0800:1700,5:Y:0800:1700,6:Y:0800:1700,7:N:0800:1700'
				},
				{
					n: 'zimbraFeatureOutOfOfficeReplyEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarViewTimeInterval',
					_content: '1h'
				},
				{
					n: 'zimbraPrefDefaultCalendarId',
					_content: '10'
				},
				{
					n: 'carbonioFeatureFilesAppEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureZXDesktopEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefComposeFormat',
					_content: 'html'
				},
				{
					n: 'zimbraPrefDisplayTimeInMailList',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefZmgPushNotificationEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefIMNotifyStatus',
					_content: 'TRUE'
				},
				{
					n: 'zimbraQuotaWarnPercent',
					_content: '90'
				},
				{
					n: 'zimbraPrefIMReportIdle',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMailForwardingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefDisplayExternalImages',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefSaveToSent',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefOutOfOfficeCacheDuration',
					_content: '2d'
				},
				{
					n: 'zimbraPrefConvReadingPaneLocation',
					_content: 'bottom'
				},
				{
					n: 'zimbraPrefShowSearchString',
					_content: 'FALSE'
				},
				{
					n: 'zimbraInterceptSubject',
					_content: 'Intercepted message for ${ACCOUNT_ADDRESS}: ${MESSAGE_SUBJECT}'
				},
				{
					n: 'zimbraMailTrustedSenderListMaxNumEntries',
					_content: '500'
				},
				{
					n: 'zimbraPrefMailSelectAfterDelete',
					_content: 'next'
				},
				{
					n: 'zimbraPrefAppleIcalDelegationEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraDataSourceQuota',
					_content: '0'
				},
				{
					n: 'carbonioWscMessageDeleteTimeLimit',
					_content: '10m'
				},
				{
					n: 'zimbraPrefHtmlEditorDefaultFontFamily',
					_content: 'arial, helvetica, sans-serif'
				},
				{
					n: 'zimbraMobilePolicyMinDevicePasswordComplexCharacters',
					_content: '0'
				},
				{
					n: 'zimbraPrefConvShowCalendar',
					_content: 'FALSE'
				},
				{
					n: 'zimbraRevokeAppSpecificPasswordsOnPasswordChange',
					_content: 'TRUE'
				},
				{
					n: 'zimbraZimletUserPropertiesMaxNumEntries',
					_content: '150'
				},
				{
					n: 'zimbraFeatureSMIMEEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarShowPastDueReminders',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyAllowPOPIMAPEmail',
					_content: '1'
				},
				{
					n: 'zimbraDataSourceMinPollingInterval',
					_content: '1m'
				},
				{
					n: 'zimbraMobilePolicyRequireSignedSMIMEMessages',
					_content: '0'
				},
				{
					n: 'zimbraFeatureMobileGatewayEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefWarnOnExit',
					_content: 'TRUE'
				},
				{
					n: 'cn',
					_content: 'default',
					c: true
				},
				{
					n: 'zimbraFeaturePriorityInboxEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefReadingPaneEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureBriefcaseSpreadsheetEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraSpamApplyUserFilters',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureAddressVerificationExpiry',
					_content: '1d'
				},
				{
					n: 'zimbraMobilePolicyMaxEmailBodyTruncationSize',
					_content: '-1'
				},
				{
					n: 'zimbraQuotaWarnInterval',
					_content: '1d'
				},
				{
					n: 'zimbraPrefIMToasterEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefOutOfOfficeStatusAlertOnLogin',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMailPriorityEnabled',
					_content: 'TRUE'
				},
				{
					n: 'carbonioWscMaxGroupMembers',
					_content: '32'
				},
				{
					n: 'zimbraPrefAutocompleteAddressBubblesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureManageZimlets',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordMinNumericChars',
					_content: '0'
				},
				{
					n: 'zimbraWebClientShowOfflineLink',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobileSmartForwardRFC822Enabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefContactsInitialView',
					_content: 'list'
				},
				{
					n: 'zimbraFeatureCalendarEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMailBlacklistMaxNumEntries',
					_content: '100'
				},
				{
					n: 'carbonioFeatureMailsAppEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefVoiceItemsPerPage',
					_content: '25'
				},
				{
					n: 'zimbraMobilePolicyAllowRemoteDesktop',
					_content: '1'
				},
				{
					n: 'zimbraFeatureDiscardInFiltersEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureTrustedDevicesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyPasswordRecoveryEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMailHighlightObjectsMaxSize',
					_content: '70'
				},
				{
					n: 'zimbraPrefMailToasterEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFileAndroidCrashReportingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefForwardReplyInOriginalFormat',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureWebSearchEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefBriefcaseReadingPaneLocation',
					_content: 'right'
				},
				{
					n: 'zimbraPrefContactsPerPage',
					_content: '25'
				},
				{
					n: 'zimbraPrefMarkMsgRead',
					_content: '0'
				},
				{
					n: 'zimbraPrefMessageIdDedupingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarApptReminderWarningTime',
					_content: '5'
				},
				{
					n: 'zimbraPrefCalendarReminderYMessenger',
					_content: 'FALSE'
				},
				{
					n: 'zimbraSieveRejectMailEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarDefaultApptDuration',
					_content: '60m'
				},
				{
					n: 'zimbraPrefDeleteInviteOnReply',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordBlockCommonEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarDayHourStart',
					_content: '8'
				},
				{
					n: 'zimbraMaxVoiceItemsPerPage',
					_content: '100'
				},
				{
					n: 'zimbraPrefPop3DeleteOption',
					_content: 'delete'
				},
				{
					n: 'zimbraDataSourceMaxNumEntries',
					_content: '20'
				},
				{
					n: 'zimbraImapEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureViewInHtmlEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraCalendarMaxRevisions',
					_content: '1'
				},
				{
					n: 'zimbraPrefTabInEditorEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMailSignatureMaxLength',
					_content: '10240'
				},
				{
					n: 'zimbraPrefCalendarAutoAddInvites',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutSuppressionCacheSize',
					_content: '1'
				},
				{
					n: 'zimbraFeatureSignaturesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordRecoveryMaxAttempts',
					_content: '10'
				},
				{
					n: 'zimbraPrefExternalSendersType',
					_content: 'ALL'
				},
				{
					n: 'zimbraPrefContactsDisableAutocompleteOnContactGroupMembers',
					_content: 'FALSE'
				},
				{
					n: 'zimbraLogOutFromAllServers',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefIMFlashTitle',
					_content: 'TRUE'
				},
				{
					n: 'carbonioFeatureChatsAppEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutMaxFailures',
					_content: '10'
				},
				{
					n: 'zimbraMobilePolicyDevicePasswordHistory',
					_content: '8'
				},
				{
					n: 'zimbraMobilePolicyAllowDesktopSync',
					_content: '1'
				},
				{
					n: 'zimbraMobileTombstoneEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureImapDataSourceEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureModernDesktopEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureSocialEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefSentLifetime',
					_content: '0'
				},
				{
					n: 'zimbraMobilePolicyAllowUnsignedInstallationPackages',
					_content: '1'
				},
				{
					n: 'zimbraContactRankingTableSize',
					_content: '200'
				},
				{
					n: 'zimbraPrefAutoCompleteQuickCompletionOnComma',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefImapEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefMailFlashIcon',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefMailSoundsEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraAuthTokenLifetime',
					_content: '2d'
				},
				{
					n: 'zimbraNewMailNotificationFrom',
					_content: 'Postmaster <postmaster@${RECIPIENT_DOMAIN}>'
				},
				{
					n: 'zimbraPrefFolderColorEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMailSendLaterEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPortalName',
					_content: 'example'
				},
				{
					n: 'zimbraSieveRequireControlEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobileSearchMimeSupportEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraTwoFactorAuthEnablementTokenLifetime',
					_content: '1h'
				},
				{
					n: 'zimbraMailThreadingAlgorithm',
					_content: 'references'
				},
				{
					n: 'zimbraMobilePolicyAllowNonProvisionableDevices',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureContactBackupEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefIMSoundsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefGalAutoCompleteEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefIMHideBlockedBuddies',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefUseSendMsgShortcut',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobileOutlookSyncEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarReminderSoundsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarShowDeclinedMeetings',
					_content: 'TRUE'
				},
				{
					n: 'zimbraDeviceAllowedPasscodeLockoutDuration',
					_content: '10m'
				},
				{
					n: 'zimbraDeviceAllowedPasscodeLockoutDuration',
					_content: '1m'
				},
				{
					n: 'zimbraDeviceAllowedPasscodeLockoutDuration',
					_content: '2m'
				},
				{
					n: 'zimbraDeviceAllowedPasscodeLockoutDuration',
					_content: '30m'
				},
				{
					n: 'zimbraDeviceAllowedPasscodeLockoutDuration',
					_content: '5m'
				},
				{
					n: 'zimbraFeatureEwsEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureComposeInNewWindowEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureContactsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefIMInstantNotify',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordMaxAge',
					_content: '0'
				},
				{
					n: 'zimbraFeatureContactsDetailedSearchEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureFlaggingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefMailInitialSearch',
					_content: 'in:inbox'
				},
				{
					n: 'zimbraPrefIMNotifyPresence',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefMandatorySpellCheckEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureSocialFiltersEnabled',
					_content: 'Facebook'
				},
				{
					n: 'zimbraFeatureSocialFiltersEnabled',
					_content: 'LinkedIn'
				},
				{
					n: 'zimbraFeatureSocialFiltersEnabled',
					_content: 'SocialCast'
				},
				{
					n: 'zimbraFeatureSocialFiltersEnabled',
					_content: 'Twitter'
				},
				{
					n: 'zimbraPrefDedupeMessagesSentToSelf',
					_content: 'dedupeNone'
				},
				{
					n: 'zimbraPrefHtmlEditorDefaultFontSize',
					_content: '12pt'
				},
				{
					n: 'zimbraExternalShareDomainWhitelistEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyAllowSMIMEEncryptionAlgorithmNegotiation',
					_content: '2'
				},
				{
					n: 'zimbraInterceptBody',
					_content:
						'Intercepted message for ${ACCOUNT_ADDRESS}.${NEWLINE}Operation=${OPERATION}, folder=${FOLDER_NAME}, folder ID=${FOLDER_ID}.'
				},
				{
					n: 'zimbraIdentityMaxNumEntries',
					_content: '20'
				},
				{
					n: 'zimbraFeatureAdminMailEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraBatchedIndexingSize',
					_content: '20'
				},
				{
					n: 'zimbraDataSourceImportOnLogin',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureMAPIConnectorEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureTwoFactorAuthRequired',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyRequireSignedSMIMEAlgorithm',
					_content: '0'
				},
				{
					n: 'carbonioFeatureTasksEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraCalendarResourceDoubleBookingAllowed',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefSentMailFolder',
					_content: 'sent'
				},
				{
					n: 'zimbraFileIOSCrashReportingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarApptVisibility',
					_content: 'public'
				},
				{
					n: 'zimbraPrefCalendarDayHourEnd',
					_content: '18'
				},
				{
					n: 'zimbraFeatureConversationsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureDistributionListExpandMembersEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutFailureLifetime',
					_content: '1h'
				},
				{
					n: 'zimbraPrefShowComposeDirection',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefShowCalendarWeek',
					_content: 'FALSE'
				},
				{
					n: 'carbonioFeatureOTPMgmtEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureImportExportFolderEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyRequireDeviceEncryption',
					_content: '0'
				},
				{
					n: 'zimbraMobilePolicyDeviceEncryptionEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFileShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraMobileNotificationEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyMaxCalendarAgeFilter',
					_content: '5'
				},
				{
					n: 'zimbraPasswordMinLowerCaseChars',
					_content: '0'
				},
				{
					n: 'zimbraPrefClientType',
					_content: 'modern'
				},
				{
					n: 'zimbraPrefIMAutoLogin',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeaturePeopleSearchEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraNotebookMaxRevisions',
					_content: '0'
				},
				{
					n: 'zimbraPrefCalendarAlwaysShowMiniCal',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefChatPlaySound',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureExternalFeedbackEnabled',
					_content: 'FALSE'
				},
				{
					n: 'carbonioWscVideoCallEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefHtmlEditorDefaultFontColor',
					_content: '#000000'
				},
				{
					n: 'zimbraMaxAppSpecificPasswords',
					_content: '25'
				},
				{
					n: 'zimbraFeatureBriefcaseDocsEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFilterSleepInterval',
					_content: '1ms'
				},
				{
					n: 'zimbraFeatureReadReceiptsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraExternalSharingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutSuppressionEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefTasksReadingPaneLocation',
					_content: 'right'
				},
				{
					n: 'zimbraPrefItemsPerVirtualPage',
					_content: '50'
				},
				{
					n: 'zimbraDisableCrossAccountConversationThreading',
					_content: 'TRUE',
					c: true
				},
				{
					n: 'zimbraSyncWindowSize',
					_content: '0'
				},
				{
					n: 'zimbraChatHistoryEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureAntispamEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefSearchTreeOpen',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefStandardClientAccessibilityMode',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefUseRfc2231',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarNotifyDelegatedChanges',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureChangePasswordEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefShowChatsFolderInMail',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyMaxDevicePasswordFailedAttempts',
					_content: '4'
				},
				{
					n: 'zimbraDeviceFileOpenWithEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMarkMailForwardedAsRead',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefConversationOrder',
					_content: 'dateDesc'
				},
				{
					n: 'carbonioPrefDarkMode',
					_content: 'auto'
				},
				{
					n: 'zimbraMobilePolicyAllowSimpleDevicePassword',
					_content: 'FALSE'
				},
				{
					n: 'zimbraDataSourceRssPollingInterval',
					_content: '12h'
				},
				{
					n: 'zimbraPrefIncludeSharedItemsInSearch',
					_content: 'TRUE'
				},
				{
					n: 'zimbraAttachmentsIndexingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraDumpsterPurgeEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefPop3Enabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraArchiveAccountNameTemplate',
					_content: '${USER}-${DATE}@${DOMAIN}.archive'
				},
				{
					n: 'zimbraStandardClientCustomPrefTabsEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraTwoFactorAuthTrustedDeviceTokenLifetime',
					_content: '30d'
				},
				{
					n: 'carbonioFeatureChatsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureVoiceEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefDelegatedSendSaveTarget',
					_content: 'owner'
				},
				{
					n: 'zimbraPrefShowSelectionCheckbox',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefPop3IncludeSpam',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureBriefcaseSlidesEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobileAttachSkippedItemEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarReminderFlashTitle',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMailForwardingInFiltersEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefDefaultPrintFontSize',
					_content: '12pt'
				},
				{
					n: 'zimbraFeatureSocialcastEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefMailFlashTitle',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefMessageViewHtmlPreferred',
					_content: 'TRUE'
				},
				{
					n: 'carbonioWscShowUsersPresence',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureCalendarUpsellEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyAllowSMIMESoftCerts',
					_content: '1'
				},
				{
					n: 'zimbraMobilePolicyMaxEmailAgeFilter',
					_content: '5'
				},
				{
					n: 'zimbraInterceptSendHeadersOnly',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobileForceSamsungProtocol25',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefFontSize',
					_content: 'normal'
				},
				{
					n: 'zimbraPrefMailPollingInterval',
					_content: '500'
				},
				{
					n: 'zimbraId',
					_content: 'e00428a1-0c00-11d9-836a-000d93afea2a',
					c: true
				},
				{
					n: 'zimbraPrefIMLogChatsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefReplyIncludeOriginalText',
					_content: 'includeBody'
				},
				{
					n: 'carbonioPrefSendAnalytics',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureGalSyncEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureIdentitiesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefIncludeTrashInSearch',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefSharedAddrBookAutoCompleteEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureImportFolderEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureOptionsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureAdvancedSearchEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarAllowCancelEmailToSelf',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureChatEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureResetPasswordSuspensionTime',
					_content: '1d'
				},
				{
					n: 'zimbraFeatureTasksEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraExternalAccountLifetimeAfterDisabled',
					_content: '30d'
				},
				{
					n: 'zimbraMailPurgeUseChangeDateForTrash',
					_content: 'TRUE'
				},
				{
					n: 'zimbraDevicePasscodeEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarAllowPublishMethodInvite',
					_content: 'FALSE'
				},
				{
					n: 'zimbraSieveImmutableHeaders',
					_content:
						'Received,DKIM-Signature,Authentication-Results,Received-SPF,Message-ID,Content-Type,Content-Disposition,Content-Transfer-Encoding,MIME-Version,Auto-Submitted'
				},
				{
					n: 'carbonioWscAttachmentUpload',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLocked',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureNewAddrBookEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyRequireEncryptedSMIMEMessages',
					_content: '0'
				},
				{
					n: 'zimbraMobilePolicyRefreshInterval',
					_content: '1440'
				},
				{
					n: 'zimbraFeatureAddressVerificationEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureVoiceChangePinEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraCalendarCalDavSharedFolderCacheDuration',
					_content: '1m'
				},
				{
					n: 'zimbraPasswordMinAlphaChars',
					_content: '0'
				},
				{
					n: 'zimbraPrefIMIdleStatus',
					_content: 'away'
				},
				{
					n: 'zimbraMailSpamLifetime',
					_content: '30d'
				},
				{
					n: 'zimbraPrefSpellIgnoreWord',
					_content: 'blog',
					c: true
				},
				{
					n: 'zimbraPrefGroupMailBy',
					_content: 'conversation'
				},
				{
					n: 'zimbraMailHostPool',
					_content: '496a3d8c-93f5-48e2-90ce-1aef54d846cc',
					c: true
				},
				{
					n: 'zimbraMailForwardingAddressMaxNumAddrs',
					_content: '100'
				},
				{
					n: 'zimbraNewMailNotificationSubject',
					_content: 'New message received at ${RECIPIENT_ADDRESS}'
				},
				{
					n: 'zimbraMailQuota',
					_content: '0'
				},
				{
					n: 'zimbraQuotaWarnMessage',
					_content:
						'From: Postmaster <postmaster@${RECIPIENT_DOMAIN}>${NEWLINE}To: ${RECIPIENT_NAME} <${RECIPIENT_ADDRESS}>${NEWLINE}Subject: Quota warning${NEWLINE}Date: ${DATE}${NEWLINE}Content-Type: text/plain${NEWLINE}${NEWLINE}Your mailbox size has reached ${MBOX_SIZE_MB}MB, which is over ${WARN_PERCENT}% of your ${QUOTA_MB}MB quota.${NEWLINE}Please delete some messages to avoid exceeding your quota.${NEWLINE}'
				},
				{
					n: 'zimbraContactAutoCompleteEmailFields',
					_content: 'email,email2,email3,workEmail1,workEmail2,workEmail3'
				},
				{
					n: 'zimbraFeatureZimbraAssistantEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraShowClientTOS',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarAllowForwardedInvite',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureGroupCalendarEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFilterBatchSize',
					_content: '10000'
				},
				{
					n: 'zimbraPrefZimletTreeOpen',
					_content: 'FALSE'
				},
				{
					n: 'carbonioWscGroupChatCreation',
					_content: 'TRUE'
				},
				{
					n: 'zimbraArchiveAccountDateTemplate',
					_content: 'yyyyMMdd'
				},
				{
					n: 'zimbraSignatureMaxNumEntries',
					_content: '20'
				},
				{
					n: 'zimbraPrefCalendarUseQuickAdd',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefComposeInNewWindow',
					_content: 'FALSE'
				},
				{
					n: 'zimbraAttachmentsBlocked',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefGalSearchEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefJunkLifetime',
					_content: '0'
				},
				{
					n: 'carbonioWscVirtualBackgroundEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefSpellIgnoreAllCaps',
					_content: 'TRUE'
				},
				{
					n: 'carbonioFeatureFilesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureManageSMIMECertificateEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMailDumpsterLifetime',
					_content: '30d'
				},
				{
					n: 'zimbraAppSpecificPasswordDuration',
					_content: '0'
				},
				{
					n: 'zimbraCalendarKeepExceptionsOnSeriesTimeChange',
					_content: 'FALSE'
				},
				{
					n: 'zimbraExportMaxDays',
					_content: '0'
				},
				{
					n: 'zimbraPrefCalendarAllowedTargetsForInviteDeniedAutoReply',
					_content: 'internal'
				},
				{
					n: 'zimbraPrefUseTimeZoneListInCalendar',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyAlphanumericDevicePasswordRequired',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefOpenMailInNewWindow',
					_content: 'FALSE'
				},
				{
					n: 'zimbraAdminAuthTokenLifetime',
					_content: '12h'
				},
				{
					n: 'zimbraFileExternalShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraFeatureTaggingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraCalendarShowResourceTabs',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyRequireStorageCardEncryption',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefMailSignatureStyle',
					_content: 'outlook'
				},
				{
					n: 'zimbraTwoFactorAuthLockoutMaxFailures',
					_content: '10'
				},
				{
					n: 'zimbraArchiveEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraDeviceOfflineCacheEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMailIdleSessionTimeout',
					_content: '1d'
				},
				{
					n: 'zimbraPop3Enabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMailAllowReceiveButNotSendWhenOverQuota',
					_content: 'FALSE'
				},
				{
					n: 'zimbraDataSourceCalendarPollingInterval',
					_content: '12h'
				},
				{
					n: 'zimbraPrefAdminConsoleWarnOnExit',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefTrashLifetime',
					_content: '0'
				},
				{
					n: 'zimbraMailMinPollingInterval',
					_content: '2m'
				},
				{
					n: 'zimbraPrefShowFragments',
					_content: 'TRUE'
				},
				{
					n: 'zimbraResetPasswordRecoveryCodeExpiry',
					_content: '10m'
				},
				{
					n: 'zimbraMobilePolicyDevicePasswordExpiration',
					_content: '0'
				},
				{
					n: 'zimbraFeatureAdminPreferencesEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureSocialExternalEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeaturePop3DataSourceEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraGalSyncAccountBasedAutoCompleteEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyAllowBrowser',
					_content: '1'
				},
				{
					n: 'zimbraJunkMessagesIndexingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureZXWebEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefContactsExpandAppleContactGroups',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPasswordMinUpperCaseChars',
					_content: '0'
				},
				{
					n: 'zimbraPrefIMFlashIcon',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobileForceProtocol25',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefMailRequestReadReceipts',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarReminderDuration1',
					_content: '-PT15M'
				},
				{
					n: 'zimbraPrefAdvancedClientEnforceMinDisplay',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPublicSharingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyAllowStorageCard',
					_content: '1'
				},
				{
					n: 'zimbraZimletLoadSynchronously',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarFirstDayOfWeek',
					_content: '0'
				},
				{
					n: 'description',
					_content: 'The default COS',
					c: true
				},
				{
					n: 'zimbraFeatureIMEnabled',
					_content: 'FALSE'
				},
				{
					n: 'carbonioFeatureWscEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraContactAutoCompleteMaxResults',
					_content: '20'
				},
				{
					n: 'zimbraMobilePolicyAllowCamera',
					_content: '1'
				},
				{
					n: 'zimbraPasswordMinDigitsOrPuncs',
					_content: '0'
				},
				{
					n: 'carbonioFeatureMeetingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFilePublicShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraPasswordMinPunctuationChars',
					_content: '0'
				},
				{
					n: 'carbonioWscMaxAttachmentSize',
					_content: '128'
				},
				{
					n: 'zimbraPrefSkin',
					_content: 'zextras'
				},
				{
					n: 'zimbraPrefForwardReplyPrefixChar',
					_content: '>'
				},
				{
					n: 'zimbraExternalShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraRecoveryAccountCodeValidity',
					_content: '1d'
				},
				{
					n: 'zimbraMobilePolicyRequireEncryptionSMIMEAlgorithm',
					_content: '0'
				},
				{
					n: 'zimbraFeatureWebClientOfflineAccessEnabled',
					_content: 'TRUE'
				},
				{
					n: 'carbonioWscShowMessageReads',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefShowAllNewMailNotifications',
					_content: 'FALSE'
				},
				{
					n: 'zimbraNotebookSanitizeHtml',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordMinAge',
					_content: '0'
				},
				{
					n: 'zimbraMaxMailItemsPerPage',
					_content: '100'
				},
				{
					n: 'zimbraSignatureMinNumEntries',
					_content: '1'
				},
				{
					n: 'zimbraMobilePolicyAllowInternetSharing',
					_content: '1'
				},
				{
					n: 'zimbraPrefAccountTreeOpen',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureSharingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefAutoSaveDraftInterval',
					_content: '30s'
				},
				{
					n: 'zimbraMobilePolicyAllowIrDA',
					_content: '1'
				},
				{
					n: 'zimbraNewMailNotificationBody',
					_content:
						'New message received at ${RECIPIENT_ADDRESS}.${NEWLINE}Sender: ${SENDER_ADDRESS}${NEWLINE}Subject: ${SUBJECT}'
				},
				{
					n: 'zimbraMobilePolicyRequireManualSyncWhenRoaming',
					_content: '0'
				},
				{
					n: 'zimbraFeatureMailUpsellEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureSavedSearchesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefForwardReplyFormat',
					_content: 'text',
					c: true
				},
				{
					n: 'zimbraPrefCalendarToasterEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyAllowConsumerEmail',
					_content: '1'
				},
				{
					n: 'zimbraFeatureFreeBusyViewEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPasswordMaxLength',
					_content: '64'
				},
				{
					n: 'zimbraFeatureTouchClientEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPasswordEnforceHistory',
					_content: '0'
				},
				{
					n: 'zimbraDumpsterEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraAttachmentsViewInHtmlOnly',
					_content: 'FALSE'
				},
				{
					n: 'zimbraSieveNotifyActionRFCCompliant',
					_content: 'FALSE'
				},
				{
					n: 'objectClass',
					_content: 'zimbraCOS',
					c: true
				},
				{
					n: 'zimbraPrefColorMessagesEnabled',
					_content: 'FALSE'
				},
				{
					n: 'carbonioPrefWebUiDarkMode',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarApptAllowAtendeeEdit',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMaxContactsPerPage',
					_content: '100'
				},
				{
					n: 'zimbraFeatureBriefcasesEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureCrocodocEnabled',
					_content: 'FALSE'
				},
				{
					n: 'carbonioWscPrivateChatCreation',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureContactsUpsellEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefIncludeSpamInSearch',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureVoiceUpsellEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarInitialView',
					_content: 'workWeek'
				},
				{
					n: 'zimbraPrefFolderTreeOpen',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefInboxUnreadLifetime',
					_content: '0'
				},
				{
					n: 'zimbraFeatureInstantNotify',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyAllowBluetooth',
					_content: '2'
				},
				{
					n: 'zimbraMobilePolicyDevicePasswordEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefImapSearchFoldersEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureResetPasswordStatus',
					_content: 'disabled'
				},
				{
					n: 'zimbraFeatureAppSpecificPasswordsEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMailPollingIntervalPreferenceEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureDistributionListFolderEnabled',
					_content: 'TRUE'
				},
				{
					n: 'carbonioWscMessageEditTimeLimit',
					_content: '10m'
				},
				{
					n: 'zimbraPrefMailSendReadReceipts',
					_content: 'prompt'
				},
				{
					n: 'zimbraShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraInterceptFrom',
					_content: 'Postmaster <postmaster@${ACCOUNT_DOMAIN}>'
				},
				{
					n: 'zimbraMobilePolicyAllowWiFi',
					_content: '1'
				},
				{
					n: 'zimbraMailWhitelistMaxNumEntries',
					_content: '100'
				},
				{
					n: 'zimbraMobilePolicyAllowTextMessaging',
					_content: '1'
				},
				{
					n: 'zimbraPrefForwardIncludeOriginalText',
					_content: 'includeBody'
				},
				{
					n: 'carbonioWscRecordingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyAllowPartialProvisioning',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefMailItemsPerPage',
					_content: '25'
				},
				{
					n: 'zimbraPrefUseKeyboardShortcuts',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPublicShareLifetime',
					_content: '0'
				},
				{
					n: 'zimbraMobilePolicyMinDevicePasswordLength',
					_content: '4'
				},
				{
					n: 'zimbraTwoFactorAuthNumScratchCodes',
					_content: '10'
				},
				{
					n: 'zimbraFeatureConfirmationPageEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFileUploadMaxSizePerFile',
					_content: '2147483648'
				},
				{
					n: 'zimbraMobilePolicySuppressDeviceEncryption',
					_content: 'FALSE'
				},
				{
					n: 'zimbraWebClientOfflineSyncMaxDays',
					_content: '30'
				},
				{
					n: 'zimbraPasswordLockoutDuration',
					_content: '1h'
				},
				{
					n: 'zimbraPrefTimeZoneId',
					_content: 'UTC'
				},
				{
					n: 'carbonioFeatureTeamEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraSieveEditHeaderEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureNewMailNotificationEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraProxyCacheableContentTypes',
					_content: 'application/x-javascript',
					c: true
				},
				{
					n: 'zimbraProxyCacheableContentTypes',
					_content: 'text/javascript',
					c: true
				},
				{
					n: 'zimbraPasswordMinLength',
					_content: '6'
				},
				{
					n: 'zimbraPrefShortEmailAddress',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureOpenMailInNewWindowEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefIMHideOfflineBuddies',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMobilePolicyAllowUnsignedApplications',
					_content: '1'
				},
				{
					n: 'zimbraMobilePolicyMaxInactivityTimeDeviceLock',
					_content: '15'
				},
				{
					n: 'zimbraFeatureGalEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFilePreviewMaxSize',
					_content: '20971520'
				},
				{
					n: 'zimbraMailPurgeUseChangeDateForSpam',
					_content: 'TRUE'
				},
				{
					n: 'zimbraContactMaxNumEntries',
					_content: '10000'
				},
				{
					n: 'zimbraMailMessageLifetime',
					_content: '0'
				},
				{
					n: 'zimbraAllowAnyFromAddress',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFreebusyLocalMailboxNotActive',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefChatEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPasswordLockoutSuppressionProtocols',
					_content: 'zsync'
				},
				{
					n: 'zimbraSmtpRestrictEnvelopeFrom',
					_content: 'FALSE'
				},
				{
					n: 'zimbraIMService',
					_content: 'zimbra'
				},
				{
					n: 'zimbraPrefInboxReadLifetime',
					_content: '0'
				},
				{
					n: 'zimbraPrefTagTreeOpen',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobileShareContactEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureGalAutoCompleteEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefGetMailAction',
					_content: 'default'
				},
				{
					n: 'zimbraMobilePolicyAllowHTMLEmail',
					_content: '1'
				},
				{
					n: 'zimbraTouchJSErrorTrackingEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureNotebookEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureWebClientEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefAutoAddAddressEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureTwoFactorAuthAvailable',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureSkinChangeEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMobilePolicyEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMobilePolicyMaxEmailHTMLBodyTruncationSize',
					_content: '-1'
				},
				{
					n: 'zimbraPrefReadingPaneLocation',
					_content: 'right'
				},
				{
					n: 'zimbraFeatureMobileAppEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraMailForwardingAddressMaxLength',
					_content: '4096'
				},
				{
					n: 'zimbraFeatureMailEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureDataSourcePurgingEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraContactEmailFields',
					_content:
						'email,email2,email3,email4,email5,email6,email7,email8,email9,email10,workEmail1,workEmail2,workEmail3'
				},
				{
					n: 'zimbraFeaturePortalEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraPrefCalendarReminderSendEmail',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureCalendarReminderDeviceEmailEnabled',
					_content: 'FALSE'
				},
				{
					n: 'zimbraFeatureShortcutAliasesEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefCalendarSendInviteDeniedAutoReply',
					_content: 'FALSE'
				},
				{
					n: 'zimbraDumpsterUserVisibleAge',
					_content: '30d'
				},
				{
					n: 'carbonioWscMaxRoomPictureSize',
					_content: '2'
				},
				{
					n: 'zimbraFeatureHtmlComposeEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureFiltersEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureFromDisplayEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraPrefIMIdleTimeout',
					_content: '10'
				},
				{
					n: 'zimbraFeatureInitialSearchPreferenceEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraFeatureMobileSyncEnabled',
					_content: 'FALSE'
				},
				{
					n: 'carbonioVideoServerRecordingEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraTwoFactorAuthTokenLifetime',
					_content: '1h'
				},
				{
					n: 'zimbraFeatureExportFolderEnabled',
					_content: 'TRUE'
				},
				{
					n: 'zimbraMailTrashLifetime',
					_content: '30d'
				},
				{
					n: 'zimbraMobileSyncRedoMaxAttempts',
					_content: 'default:1'
				},
				{
					n: 'zimbraMobileSyncRedoMaxAttempts',
					_content: 'windows:2'
				}
			]
		}
	],
	_jsns: 'urn:zimbraAdmin'
};

function expectGeneralOptionsSectionVisible() {
	expect(page.getByText('General Options')).toBeVisible();
	expect(page.getByText('English - English')).toBeVisible();
	expect(page.getByText('Language')).toBeVisible();
}

function expectMailOptionsSectionVisible() {
	expect(page.getByText('Mail Options')).toBeVisible();
	expect(page.getByText('View mail as HTML (when possible)')).toBeVisible();
	expect(page.getByText('Display by')).toBeVisible();
	expect(page.getByText('Message', { exact: true })).toBeVisible();
	expect(page.getByText('Default Charset')).toBeVisible();
	expect(page.getByText('Big5')).toBeVisible();
	expect(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
	expect(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
	expect(page.getByText('Maximum size (bytes) allowed for each attachment')).toBeVisible();
	expect(page.getByText('~2 GB')).toBeVisible();
}

function expectReceivingMailsSectionVisible() {
	expect(page.getByText('Receiving Mails')).toBeVisible();
	expect(page.getByText('Minimum mail polling interval')).toBeVisible();
	expect(page.getByText('Days / Hours / Minutes / Sec')).toBeVisible();
	expect(page.getByText('Polling interval', { exact: true })).toBeVisible();
}

function expectForwardingSectionVisible() {
	expect(page.getByText('Forwarding', { exact: true })).toBeVisible();
	expect(page.getByText('User can specify forwarding address')).toBeVisible();
	expect(page.getByText('User can specify mail forwarding filter')).toBeVisible();
}

function expectSendingMailsSectionVisible() {
	expect(page.getByText('Sending Mails')).toBeVisible();
	expect(page.getByText('Save to sent')).toBeVisible();
	expect(page.getByText('Allow the user to ask for a read receipt')).toBeVisible();
}

function expectContactOptionsSectionVisible() {
	expect(page.getByText('Contact Options')).toBeVisible();
	expect(page.getByText('Enable auto-add contacts')).toBeVisible();
	expect(page.getByText('Use GAL to auto-fill')).toBeVisible();
}

function expectCalendarOptionsVisible() {
	expect(page.getByText('Calendar Options')).toBeVisible();
	expect(page.getByText('Time Zone')).toBeVisible();
	expect(page.getByText('Appointment’s Default Duration')).toBeVisible();
	expect(page.getByText('Appointment Reminder (minutes before)')).toBeVisible();
	expect(page.getByText('Default Calendar View')).toBeVisible();
	expect(page.getByText('The Week starts on')).toBeVisible();
	expect(page.getByText('Default appointment visibility')).toBeVisible();
	expect(page.getByText('Enable reminders of appointments in the past')).toBeVisible();
	expect(page.getByText('Allow sending cancellation mail')).toBeVisible();
	expect(page.getByText('Automatically add forwarded appointments to the calendar')).toBeVisible();
	expect(page.getByText('Add invites with PUBLISH method')).toBeVisible();
	expect(page.getByText('Automatically add appointments when the user is invited')).toBeVisible();
	expect(page.getByText('Auto-decline if the sender is blacklisted')).toBeVisible();
	expect(page.getByText('Notify changes made by delegated accounts')).toBeVisible();
	expect(page.getByText('Use iCal delegation model for shared calendars')).toBeVisible();
}

describe('COSPreferences', () => {
	const setupCosStore = (): void => {
		useCosStore.getState().setCos({
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			name: 'default',
			isDefaultCos: true,
			a: [
				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
				{ n: 'zimbraPrefLocale', _content: 'en' },
				{ n: 'zimbraFeatureReadReceiptsEnabled', _content: 'FALSE' },
				{ n: 'zimbraPrefMailSendReadReceipts', _content: 'never' }
			]
		});
	};

	beforeEach(async () => {
		vi.resetAllMocks();
		setupCosStore();

		// Set up user account store for useCurrentUserRights hook
		useAccountStore.setState({
			account: {
				id: 'test-user-id',
				name: 'test@example.com',
				displayName: '',
				signatures: {
					signature: []
				},
				identities: undefined,
				rights: { targets: [] }
			},
			settings: {
				prefs: {},
				attrs: {},
				props: []
			},
			usedQuota: 0
		});

		// // Mock ModifyCos API call
		// createSoapAPIInterceptor('ModifyCos', {
		// 	cos: [
		// 		{
		// 			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
		// 			name: 'default',
		// 			isDefaultCos: true,
		// 			a: [
		// 				{ n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
		// 				{ n: 'zimbraPrefLocale', _content: 'en' },
		// 				{ n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'TRUE' },
		// 				{ n: 'zimbraFeatureReadReceiptsEnabled', _content: 'TRUE' }, // Changed to TRUE after toggle
		// 				{ n: 'zimbraPrefMailSendReadReceipts', _content: 'always' } // Changed after selection
		// 			]
		// 		}
		// 	]
		// });

		// Mock FlushCache API call
		createSoapAPIInterceptor('FlushCache', {});
	});

	afterEach(() => {
		resetMockWorker();
		useCosStore.getState().reset();
	});

	it('should render the component correctly', async () => {
		createSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
		createSoapAPIInterceptor('GetCos', getCosResponseLong);
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<COSPreferences />);
		expect(page.getByText('Preferences')).toBeVisible();
		expectGeneralOptionsSectionVisible();
		expectMailOptionsSectionVisible();
		expectReceivingMailsSectionVisible();
		expectForwardingSectionVisible();
		expectSendingMailsSectionVisible();
		expectContactOptionsSectionVisible();
		expectCalendarOptionsVisible();
	});

	it('should toggle zimbraFeatureReadReceiptsEnabled when clicking the read receipt switch', async () => {
		const getrightsinterceptor = createSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
		setupBrowserTest(<COSPreferences />);

		// Wait for the component to render
		await expect.element(page.getByText('Sending Mails')).toBeVisible();

		await getrightsinterceptor;

		// Find the "Allow the user to ask for a read receipt" label
		const readReceiptLabel = page.getByText('Allow the user to ask for a read receipt');
		await expect.element(readReceiptLabel).toBeVisible();

		// Click on the label which will trigger the switch
		await readReceiptLabel.click();

		// Verify the Save button appears after the change (indicating unsaved changes)
		const saveButton = page.getByRole('button', { name: 'Save' });
		await expect.element(saveButton).toBeVisible();
	});

	it('should change zimbraPrefMailSendReadReceipts when selecting a different option', async () => {
		createSoapAPIInterceptor('GetAllEffectiveRights', {
			target: mockRightsData
		});
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<COSPreferences />);

		// Wait for the Receiving Mails section to render
		await expect.element(page.getByText('Receiving Mails')).toBeVisible();

		// In the "Receiving Mails" section, find the "Read Receipt settings" select dropdown
		const readReceiptSettingsLabel = page.getByText('Read Receipt settings');
		await expect.element(readReceiptSettingsLabel).toBeVisible();

		// Click on the select to open the dropdown
		await readReceiptSettingsLabel.click();

		// Select "Always send a read receipt" option
		const alwaysSendOption = page.getByText('Always send a read receipt');
		await alwaysSendOption.click();

		// Verify the Save button appears after the change
		const saveButton = page.getByRole('button', { name: 'Save' });
		await expect.element(saveButton).toBeVisible();
	});
});
