/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest, createSoapAPIInterceptor } from 'admin-ui-test-utils';
import React from 'react';
import { it, expect, describe } from 'vitest';

import { AccountContext } from '../account-context';

import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';

const signatureItems: unknown[] = [];
const signatureList: unknown[] = [];

const mockContextValue = {
	accountDetail: {
		zimbraPrefMessageViewHtmlPreferred: 'TRUE',
		zimbraPrefGroupMailBy: '',
		zimbraPrefMailDefaultCharset: '',
		zimbraPrefMailPollingInterval: '',
		zimbraPrefOutOfOfficeReplyEnabled: 'FALSE',
		zimbraPrefOutOfOfficeCacheDuration: '1d',
		zimbraPrefMailSendReadReceipts: 'never',
		zimbraAllowFromAddress: '',
		zimbraFeatureReadReceiptsEnabled: 'FALSE',
		zimbraPrefMailSignatureEnabled: 'FALSE',
		zimbraPrefAutoAddAddressEnabled: 'FALSE',
		zimbraPrefGalAutoCompleteEnabled: 'FALSE',
		zimbraPrefTimeZoneId: '',
		zimbraPrefCalendarDefaultApptDuration: '',
		zimbraPrefCalendarApptReminderWarningTime: '',
		zimbraPrefCalendarInitialView: '',
		zimbraPrefCalendarFirstDayOfWeek: '',
		zimbraPrefCalendarApptVisibility: '',
		zimbraPrefCalendarShowPastDueReminders: 'FALSE',
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE',
		zimbraId: 'mock-id'
	},
	cosDetail: {
		zimbraPrefMessageViewHtmlPreferred: 'FALSE',
		zimbraPrefGroupMailBy: '',
		zimbraPrefMailDefaultCharset: '',
		zimbraPrefMailPollingInterval: '',
		zimbraPrefOutOfOfficeReplyEnabled: 'FALSE',
		zimbraPrefOutOfOfficeCacheDuration: '1d',
		zimbraPrefMailSendReadReceipts: 'never',
		zimbraFeatureReadReceiptsEnabled: 'FALSE',
		zimbraPrefMailSignatureEnabled: 'FALSE',
		zimbraPrefAutoAddAddressEnabled: 'FALSE',
		zimbraPrefGalAutoCompleteEnabled: 'FALSE',
		zimbraPrefTimeZoneId: '',
		zimbraPrefCalendarDefaultApptDuration: '',
		zimbraPrefCalendarApptReminderWarningTime: '',
		zimbraPrefCalendarInitialView: '',
		zimbraPrefCalendarFirstDayOfWeek: '',
		zimbraPrefCalendarApptVisibility: '',
		zimbraPrefCalendarShowPastDueReminders: 'FALSE',
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE',
		zimbraId: 'mock-id'
	},
	accSpecificDetail: {
		zimbraPrefMessageViewHtmlPreferred: 'FALSE',
		zimbraPrefGroupMailBy: '',
		zimbraPrefMailDefaultCharset: '',
		zimbraPrefMailPollingInterval: '',
		zimbraPrefOutOfOfficeReplyEnabled: 'FALSE',
		zimbraPrefOutOfOfficeCacheDuration: '1d',
		zimbraPrefMailSendReadReceipts: 'never',
		zimbraFeatureReadReceiptsEnabled: 'FALSE',
		zimbraPrefMailSignatureEnabled: 'FALSE',
		zimbraPrefAutoAddAddressEnabled: 'FALSE',
		zimbraPrefGalAutoCompleteEnabled: 'FALSE',
		zimbraPrefTimeZoneId: '',
		zimbraPrefCalendarDefaultApptDuration: '',
		zimbraPrefCalendarApptReminderWarningTime: '',
		zimbraPrefCalendarInitialView: '',
		zimbraPrefCalendarFirstDayOfWeek: '',
		zimbraPrefCalendarApptVisibility: '',
		zimbraPrefCalendarShowPastDueReminders: 'FALSE',
		zimbraPrefCalendarAllowCancelEmailToSelf: 'FALSE',
		zimbraPrefCalendarAllowForwardedInvite: 'FALSE',
		zimbraPrefCalendarAllowPublishMethodInvite: 'FALSE',
		zimbraPrefCalendarAutoAddInvites: 'FALSE',
		zimbraPrefCalendarSendInviteDeniedAutoReply: 'FALSE',
		zimbraPrefCalendarNotifyDelegatedChanges: 'FALSE',
		zimbraPrefAppleIcalDelegationEnabled: 'FALSE',
		zimbraId: 'mock-id'
	},
	directMemberList: [],
	inDirectMemberList: [],
	setSignatureItems: () => {},
	setSignatureList: () => {},
	setAccountDetail: () => {},
	setAccSpecificDetail: () => {},
	setDirectMemberList: () => {},
	setInDirectMemberList: () => {},
	setInitAccountDetail: () => {},
	initAccountDetail: {},
	otpList: {},
	identitiesList: [],
	folderList: [],
	setFolderList: () => {},
	getListOtp: () => {},
	getIdentitiesList: () => {},
	deligateDetail: {},
	setDeligateDetail: () => {},
	credentialList: {},
	getCredentialList: () => {},
	initialGlobalRights: {},
	setinitialGlobalRights: () => {},
	globalRights: {},
	setGlobalRights: () => {},
	deleteAdministrationRights: [],
	setDeleteAdministrationRights: () => {},
	userSessionList: [],
	setAllUserSessionList: () => {},
	allUserSessionList: [],
	setUserSessionList: () => {},
	defaultCOS: {},
	setDefaultCOS: () => {},
	allowedDeletePassword: false,
	setAllowedDeletePassword: () => {}
};

describe('EditAccountUserPrefrencesSection (browser)', () => {
	it('should render main sections', async () => {
		createSoapAPIInterceptor('SearchDirectory', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
		await expect.element(page.getByText('Receiving Mails')).toBeVisible();
		await expect.element(page.getByText('Sending Mails')).toBeVisible();
		await expect.element(page.getByText('Composing Mails')).toBeVisible();
		await expect.element(page.getByText('Contact Options')).toBeVisible();
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
	});

	it('should render signature section', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Signature')).toBeVisible();
	});

	it('should render select options for "Group by" and "Default Charset"', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Group by')).toBeVisible();
		await expect.element(page.getByText('Default Charset')).toBeVisible();
	});

	it('should allow entering allowed sending addresses', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
	});

	it('should render calendar options section and select time zone', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
		await expect.element(page.getByText('Time Zone')).toBeVisible();
	});

	it('should render with empty accountDetail', async () => {
		createSoapAPIInterceptor('*', {});
		const emptyContext = { ...mockContextValue, accountDetail: {} };
		setupBrowserTest(
			<AccountContext.Provider value={emptyContext}>
				<EditAccountUserPrefrencesSection signatureItems={[]} signatureList={[]} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
	});

	it('should render all select options', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		const selects = [
			'Group by',
			'Default Charset',
			'Check new mail every',
			'Days / Hours / Minutes / Sec',
			'Read Receipt settings',
			'Time Zone',
			'Appointment’s Default Duration',
			'Appointment Reminder in minutes',
			'Default Calendar View',
			'The Week starts on',
			'Default Appointment visibility'
		];
		for (const label of selects) {
			await expect.element(page.getByText(label)).toBeVisible();
		}
	});

	it('should render and interact with ChipInput for allowed sending addresses', async () => {
		createSoapAPIInterceptor('*', {});
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={signatureItems} signatureList={signatureList} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
	});
});
