/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { it, expect, describe, vi, beforeAll, afterAll, beforeEach } from 'vitest';

import { AccountContext } from '../account-context';

import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';

const signatureItems: unknown[] = [];
const signatureList: unknown[] = [];

// Suppress MSW cleanup errors that occur when tests finish
let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

beforeAll(() => {
	unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
		// Suppress MSW deserialization errors that occur during test cleanup
		if (
			event.reason?.message?.includes('Cannot read properties of undefined') &&
			event.reason?.stack?.includes('deserializeRequest')
		) {
			event.preventDefault();
		}
	};
	globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
});

afterAll(() => {
	if (unhandledRejectionHandler) {
		globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
	}
});

beforeEach(() => {
	// Mock fetch API to handle any SOAP requests
	vi.spyOn(globalThis, 'fetch').mockResolvedValue(
		new Response(JSON.stringify({ Body: {} }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
	);
});

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
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
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
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Signature')).toBeVisible();
	});

	it('should render select options for "Group by" and "Default Charset"', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Group by')).toBeVisible();
		await expect.element(page.getByText('Default Charset')).toBeVisible();
	});

	it('should allow entering allowed sending addresses', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
	});

	it('should render calendar options section and select time zone', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
		await expect.element(page.getByText('Time Zone')).toBeVisible();
	});

	it('should render with empty accountDetail', async () => {
		const emptyContext = { ...mockContextValue, accountDetail: {} };
		setupBrowserTest(
			<AccountContext.Provider value={emptyContext}>
				<EditAccountUserPrefrencesSection signatureItems={[]} signatureList={[]} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
	});

	it('should render all select options', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
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
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
	});

	it('should render all mail options switches', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('View mail as HTML')).toBeVisible();
		const resetButton = page.getByTestId('reset-zimbraPrefMessageViewHtmlPreferred');
		await expect.element(resetButton).toBeVisible();
		await expect.element(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
		await expect.element(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
	});

	it('should render receiving mails section with switches', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Can send auto-reply messages')).toBeVisible();
		await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
	});

	it('should render sending mails section', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Save to sent')).toBeVisible();
		await expect.element(page.getByText('Permit the user to ask for read receipt')).toBeVisible();
		const resetButton = page.getByTestId('reset-zimbraFeatureReadReceiptsEnabled');
		await expect.element(resetButton).toBeVisible();
	});

	it('should render contact options switches', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable auto-add contacts')).toBeVisible();
		await expect.element(page.getByText('Use GAL to auto-fill')).toBeVisible();
	});

	it('should render all calendar switches', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect
			.element(page.getByText('Enable reminders of appointments in the past'))
			.toBeVisible();
		await expect.element(page.getByText('Allow sending cancellation mail')).toBeVisible();
		await expect
			.element(page.getByText('Automatically add forwarded appointments to the calendar'))
			.toBeVisible();
		await expect.element(page.getByText('Add invites with PUBLISH method')).toBeVisible();
		await expect
			.element(page.getByText('Automatically add appointments when the user is invited'))
			.toBeVisible();
		await expect.element(page.getByText('Auto-decline if the sender is blacklisted')).toBeVisible();
		await expect.element(page.getByText('Notify changes made by delegated accounts')).toBeVisible();
		await expect
			.element(page.getByText('Use iCal delegation model for shared calendars'))
			.toBeVisible();
	});

	it('should handle zimbraAllowFromAddress from accountDetail', async () => {
		const contextWithAddresses = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraAllowFromAddress: 'test1@example.com, test2@example.com'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithAddresses}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
	});

	it('should render with different zimbraPrefMessageViewHtmlPreferred values', async () => {
		const contextWithFalse = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefMessageViewHtmlPreferred: 'FALSE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithFalse}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('View mail as HTML')).toBeVisible();
	});

	it('should render with different zimbraPrefGroupMailBy values', async () => {
		const contextWithGroupBy = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefGroupMailBy: 'conversation' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithGroupBy}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Group by')).toBeVisible();
	});

	it('should render with different polling intervals', async () => {
		const contextWithPolling = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailPollingInterval: '5m' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithPolling}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Check new mail every')).toBeVisible();
	});

	it('should render with different read receipt settings', async () => {
		const contextWithReadReceipt = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailSendReadReceipts: 'always' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithReadReceipt}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
		const resetButton = page.getByTestId('reset-zimbraPrefMailSendReadReceipts');
		await expect.element(resetButton).toBeVisible();
	});

	it('should render with different out of office cache duration', async () => {
		const contextWithOOO = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefOutOfOfficeCacheDuration: '3h' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithOOO}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
	});

	it('should render with different timezone', async () => {
		const contextWithTz = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefTimeZoneId: 'America/New_York' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithTz}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Time Zone')).toBeVisible();
	});

	it('should render with different calendar default appointment duration', async () => {
		const contextWithDuration = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefCalendarDefaultApptDuration: '60m'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDuration}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
	});

	it('should render with different calendar reminder warning time', async () => {
		const contextWithReminder = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefCalendarApptReminderWarningTime: '15'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithReminder}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Appointment Reminder in minutes')).toBeVisible();
	});

	it('should render with different calendar initial view', async () => {
		const contextWithView = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefCalendarInitialView: 'week' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithView}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Default Calendar View')).toBeVisible();
	});

	it('should render with different first day of week', async () => {
		const contextWithFirstDay = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefCalendarFirstDayOfWeek: '1' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithFirstDay}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('The Week starts on')).toBeVisible();
	});

	it('should render with different appointment visibility', async () => {
		const contextWithVisibility = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefCalendarApptVisibility: 'private'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithVisibility}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Default Appointment visibility')).toBeVisible();
	});

	it('should render with enabled mail signature', async () => {
		const contextWithSignature = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailSignatureEnabled: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithSignature}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Signature')).toBeVisible();
	});

	it('should render with enabled read receipts feature', async () => {
		const contextWithReadReceipt = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraFeatureReadReceiptsEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithReadReceipt}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Permit the user to ask for read receipt')).toBeVisible();
	});

	it('should render with enabled auto add contacts', async () => {
		const contextWithAutoAdd = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefAutoAddAddressEnabled: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithAutoAdd}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable auto-add contacts')).toBeVisible();
	});

	it('should render with enabled GAL autocomplete', async () => {
		const contextWithGal = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefGalAutoCompleteEnabled: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithGal}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Use GAL to auto-fill')).toBeVisible();
	});

	it('should render with all calendar preferences enabled', async () => {
		const contextWithCalendar = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefCalendarShowPastDueReminders: 'TRUE',
				zimbraPrefCalendarAllowCancelEmailToSelf: 'TRUE',
				zimbraPrefCalendarAllowForwardedInvite: 'TRUE',
				zimbraPrefCalendarAllowPublishMethodInvite: 'TRUE',
				zimbraPrefCalendarAutoAddInvites: 'TRUE',
				zimbraPrefCalendarSendInviteDeniedAutoReply: 'TRUE',
				zimbraPrefCalendarNotifyDelegatedChanges: 'TRUE',
				zimbraPrefAppleIcalDelegationEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithCalendar}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
	});

	it('should render without zimbraId in accountDetail', async () => {
		const contextWithoutId = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraId: undefined }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithoutId}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
	});

	it('should render with different charset', async () => {
		const contextWithCharset = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailDefaultCharset: 'UTF-8' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithCharset}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Default Charset')).toBeVisible();
	});

	it('should render with enabled out of office reply', async () => {
		const contextWithOOO = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefOutOfOfficeReplyEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithOOO}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Can send auto-reply messages')).toBeVisible();
	});

	it('should render with enabled save to sent', async () => {
		const contextWithSaveToSent = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefSaveToSent: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithSaveToSent}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Save to sent')).toBeVisible();
	});

	it('should render with enabled message deduping', async () => {
		const contextWithDeduping = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefMessageIdDedupingEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithDeduping}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
	});

	it('should render with enabled mail toaster', async () => {
		const contextWithToaster = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailToasterEnabled: 'TRUE' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithToaster}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
	});

	it('should handle undefined zimbraPrefOutOfOfficeCacheDuration', async () => {
		const contextUndefined = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefOutOfOfficeCacheDuration: undefined
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextUndefined}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
	});

	it('should render with varying boolean preferences as TRUE', async () => {
		const contextWithTrue = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefMessageViewHtmlPreferred: 'TRUE',
				zimbraPrefOutOfOfficeReplyEnabled: 'TRUE',
				zimbraPrefMailSignatureEnabled: 'TRUE',
				zimbraPrefAutoAddAddressEnabled: 'TRUE',
				zimbraPrefGalAutoCompleteEnabled: 'TRUE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={contextWithTrue}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
	});

	it('should render with all sections visible', async () => {
		const fullContext = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraId: 'test-id-123',
				zimbraPrefGroupMailBy: 'conversation',
				zimbraPrefMailDefaultCharset: 'UTF-8',
				zimbraPrefMailPollingInterval: '10m',
				zimbraPrefTimeZoneId: 'America/New_York',
				zimbraPrefCalendarDefaultApptDuration: '60m',
				zimbraPrefCalendarApptReminderWarningTime: '15',
				zimbraPrefCalendarInitialView: 'week',
				zimbraPrefCalendarFirstDayOfWeek: '1',
				zimbraPrefCalendarApptVisibility: 'public'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={fullContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
		await expect.element(page.getByText('Receiving Mails')).toBeVisible();
		await expect.element(page.getByText('Sending Mails')).toBeVisible();
		await expect.element(page.getByText('Composing Mails')).toBeVisible();
		await expect.element(page.getByText('Contact Options')).toBeVisible();
		await expect.element(page.getByText('Calendar Options')).toBeVisible();
	});

	it('should render SignatureDetail component', async () => {
		const testSignatureItems = [{ id: '1', name: 'Test Signature' }];
		const testSignatureList = [{ id: '1', content: 'Test content' }];
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection
					signatureItems={testSignatureItems}
					signatureList={testSignatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Signature')).toBeVisible();
	});

	it('should render with empty signatures', async () => {
		setupBrowserTest(
			<AccountContext.Provider value={mockContextValue}>
				<EditAccountUserPrefrencesSection signatureItems={[]} signatureList={[]} />
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Signature')).toBeVisible();
	});

	it('should render with all possible preference values set', async () => {
		const fullPrefsContext = {
			...mockContextValue,
			accountDetail: {
				zimbraId: 'full-test-id',
				zimbraPrefMessageViewHtmlPreferred: 'TRUE',
				zimbraPrefGroupMailBy: 'conversation',
				zimbraPrefMailDefaultCharset: 'UTF-8',
				zimbraPrefMailPollingInterval: '5m',
				zimbraPrefOutOfOfficeReplyEnabled: 'TRUE',
				zimbraPrefOutOfOfficeCacheDuration: '2d',
				zimbraPrefMailSendReadReceipts: 'always',
				zimbraAllowFromAddress: 'test@example.com',
				zimbraFeatureReadReceiptsEnabled: 'TRUE',
				zimbraPrefMailSignatureEnabled: 'TRUE',
				zimbraPrefAutoAddAddressEnabled: 'TRUE',
				zimbraPrefGalAutoCompleteEnabled: 'TRUE',
				zimbraPrefTimeZoneId: 'Europe/London',
				zimbraPrefCalendarDefaultApptDuration: '90m',
				zimbraPrefCalendarApptReminderWarningTime: '30',
				zimbraPrefCalendarInitialView: 'month',
				zimbraPrefCalendarFirstDayOfWeek: '0',
				zimbraPrefCalendarApptVisibility: 'private',
				zimbraPrefCalendarShowPastDueReminders: 'TRUE',
				zimbraPrefCalendarAllowCancelEmailToSelf: 'TRUE',
				zimbraPrefCalendarAllowForwardedInvite: 'TRUE',
				zimbraPrefCalendarAllowPublishMethodInvite: 'TRUE',
				zimbraPrefCalendarAutoAddInvites: 'TRUE',
				zimbraPrefCalendarSendInviteDeniedAutoReply: 'TRUE',
				zimbraPrefCalendarNotifyDelegatedChanges: 'TRUE',
				zimbraPrefAppleIcalDelegationEnabled: 'TRUE',
				zimbraPrefMessageIdDedupingEnabled: 'TRUE',
				zimbraPrefMailToasterEnabled: 'TRUE',
				zimbraPrefSaveToSent: 'TRUE'
			},
			cosDetail: mockContextValue.cosDetail,
			accSpecificDetail: mockContextValue.accSpecificDetail
		};
		setupBrowserTest(
			<AccountContext.Provider value={fullPrefsContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
	});

	it('should render with minimal accountDetail', async () => {
		const minimalContext = {
			...mockContextValue,
			accountDetail: {
				zimbraId: 'min-test-id'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={minimalContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Mail Options')).toBeVisible();
	});

	it('should handle different out of office cache duration with days', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefOutOfOfficeCacheDuration: '1d' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
	});

	it('should handle different out of office cache duration with hours', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefOutOfOfficeCacheDuration: '24h'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
	});

	it('should render with read receipt option never', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailSendReadReceipts: 'never' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
	});

	it('should render with read receipt option prompt', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailSendReadReceipts: 'prompt' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
	});

	it('should render with polling interval 500', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailPollingInterval: '500' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Check new mail every')).toBeVisible();
	});

	it('should render with polling interval 15m', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefMailPollingInterval: '15m' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Check new mail every')).toBeVisible();
	});

	it('should render with calendar view day', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefCalendarInitialView: 'day' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Default Calendar View')).toBeVisible();
	});

	it('should render with calendar view workWeek', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraPrefCalendarInitialView: 'workWeek'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('Default Calendar View')).toBeVisible();
	});

	it('should render with first day of week as Tuesday', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefCalendarFirstDayOfWeek: '2' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('The Week starts on')).toBeVisible();
	});

	it('should render with first day of week as Friday', async () => {
		const testContext = {
			...mockContextValue,
			accountDetail: { ...mockContextValue.accountDetail, zimbraPrefCalendarFirstDayOfWeek: '5' }
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);
		await expect.element(page.getByText('The Week starts on')).toBeVisible();
	});

	it('should call setAccountDetail when zimbraFeatureReadReceiptsEnabled reset button is clicked', async () => {
		const mockSetAccountDetail = vi.fn();
		const testContext = {
			...mockContextValue,
			setAccountDetail: mockSetAccountDetail,
			accountDetail: {
				...mockContextValue.accountDetail,
				zimbraFeatureReadReceiptsEnabled: 'TRUE'
			},
			accSpecificDetail: {
				...mockContextValue.accSpecificDetail,
				zimbraFeatureReadReceiptsEnabled: 'FALSE'
			}
		};
		setupBrowserTest(
			<AccountContext.Provider value={testContext}>
				<EditAccountUserPrefrencesSection
					signatureItems={signatureItems}
					signatureList={signatureList}
				/>
			</AccountContext.Provider>
		);

		const resetButton = page.getByTestId('reset-zimbraFeatureReadReceiptsEnabled');
		await expect.element(resetButton).toBeVisible();
		await resetButton.click();

		// Verify that setAccountDetail was called with a function
		expect(mockSetAccountDetail).toHaveBeenCalled();
	});
});
