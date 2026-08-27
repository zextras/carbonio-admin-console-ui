/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import EditAccountUserPreferencesSection from '../user-pref-section';
import { AccountFormTestProvider } from './account-form-test-provider';

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
      headers: { 'Content-Type': 'application/json' },
    }),
  );
});

const mockAccountDetail = {
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
  zimbraId: 'mock-id',
};

const mockCosDetail = {
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
  zimbraId: 'mock-id',
};

const mockAccSpecificDetail = {
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
  zimbraId: 'mock-id',
};

function wrapUserPref(accountDetailOverrides: Record<string, unknown> = {}): React.ReactElement {
  return (
    <AccountFormTestProvider
      values={{ ...mockAccountDetail, ...accountDetailOverrides }}
      contextOverrides={{
        cosDetail: mockCosDetail,
        accSpecificDetail: mockAccSpecificDetail,
      }}
    >
      <EditAccountUserPreferencesSection />
    </AccountFormTestProvider>
  );
}

describe('EditAccountUserPreferencesSection (browser)', () => {
  it('should render main sections', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Mail Options')).toBeVisible();
    await expect.element(page.getByText('Receiving Mails')).toBeVisible();
    await expect.element(page.getByText('Sending Mails')).toBeVisible();
    await expect.element(page.getByText('Composing Mails')).toBeVisible();
    await expect.element(page.getByText('Contact Options')).toBeVisible();
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
  });

  it('should render signature section', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Mail Signature')).toBeVisible();
  });

  it('should render select options for "Group by" and "Default Charset"', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Group by')).toBeVisible();
    await expect.element(page.getByText('Default Charset')).toBeVisible();
  });

  it('should allow entering allowed sending addresses', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
  });

  it('should render calendar options section and select time zone', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
    await expect.element(page.getByText('Time Zone')).toBeVisible();
  });

  it('should render with empty accountDetail', async () => {
    const overrides_emptyContext = {};
    setupBrowserTest(wrapUserPref(overrides_emptyContext));
    await expect.element(page.getByText('Mail Options')).toBeVisible();
  });

  it('should render all select options', async () => {
    setupBrowserTest(wrapUserPref());
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
      'Default Appointment visibility',
    ];
    for (const label of selects) {
      await expect.element(page.getByText(label)).toBeVisible();
    }
  });

  it('should render and interact with ChipInput for allowed sending addresses', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
  });

  it('should render all mail options switches', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('View mail as HTML')).toBeVisible();
    const resetButton = page.getByTestId('reset-zimbraPrefMessageViewHtmlPreferred');
    await expect.element(resetButton).toBeVisible();
    await expect.element(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
    await expect.element(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
  });

  it('should render receiving mails section with switches', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Can send auto-reply messages')).toBeVisible();
    await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
  });

  it('should render sending mails section', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Save to sent')).toBeVisible();
    await expect.element(page.getByText('Allow the user to ask for a read receipt')).toBeVisible();
    const resetButton = page.getByTestId('reset-zimbraFeatureReadReceiptsEnabled');
    await expect.element(resetButton).toBeVisible();
  });

  it('should render contact options switches', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Enable auto-add contacts')).toBeVisible();
    await expect.element(page.getByText('Use GAL to auto-fill')).toBeVisible();
  });

  it('should render all calendar switches', async () => {
    setupBrowserTest(wrapUserPref());
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
    const overrides_contextWithAddresses = {
      zimbraAllowFromAddress: 'test1@example.com, test2@example.com',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithAddresses));
    await expect.element(page.getByText('Allowed sending Addresses')).toBeVisible();
  });

  it('should render with different zimbraPrefMessageViewHtmlPreferred values', async () => {
    const overrides_contextWithFalse = {
      zimbraPrefMessageViewHtmlPreferred: 'FALSE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithFalse));
    await expect.element(page.getByText('View mail as HTML')).toBeVisible();
  });

  it('should render with different zimbraPrefGroupMailBy values', async () => {
    const overrides_contextWithGroupBy = { zimbraPrefGroupMailBy: 'conversation' };
    setupBrowserTest(wrapUserPref(overrides_contextWithGroupBy));
    await expect.element(page.getByText('Group by')).toBeVisible();
  });

  it('should render with different polling intervals', async () => {
    const overrides_contextWithPolling = { zimbraPrefMailPollingInterval: '5m' };
    setupBrowserTest(wrapUserPref(overrides_contextWithPolling));
    await expect.element(page.getByText('Check new mail every')).toBeVisible();
  });

  it('should render with different read receipt settings', async () => {
    const overrides_contextWithReadReceipt = {
      zimbraPrefMailSendReadReceipts: 'always',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithReadReceipt));
    await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
    const resetButton = page.getByTestId('reset-zimbraPrefMailSendReadReceipts');
    await expect.element(resetButton).toBeVisible();
  });

  it('should render with different out of office cache duration', async () => {
    const overrides_contextWithOOO = {
      zimbraPrefOutOfOfficeCacheDuration: '3h',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithOOO));
    await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
  });

  it('should render with different timezone', async () => {
    const overrides_contextWithTz = {
      zimbraPrefTimeZoneId: 'America/New_York',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithTz));
    await expect.element(page.getByText('Time Zone')).toBeVisible();
  });

  it('should render with different calendar default appointment duration', async () => {
    const overrides_contextWithDuration = {
      zimbraPrefCalendarDefaultApptDuration: '60m',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithDuration));
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
  });

  it('should render with different calendar reminder warning time', async () => {
    const overrides_contextWithReminder = {
      zimbraPrefCalendarApptReminderWarningTime: '15',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithReminder));
    await expect.element(page.getByText('Appointment Reminder in minutes')).toBeVisible();
  });

  it('should render with different calendar initial view', async () => {
    const overrides_contextWithView = { zimbraPrefCalendarInitialView: 'week' };
    setupBrowserTest(wrapUserPref(overrides_contextWithView));
    await expect.element(page.getByText('Default Calendar View')).toBeVisible();
  });

  it('should render with different first day of week', async () => {
    const overrides_contextWithFirstDay = { zimbraPrefCalendarFirstDayOfWeek: '1' };
    setupBrowserTest(wrapUserPref(overrides_contextWithFirstDay));
    await expect.element(page.getByText('The Week starts on')).toBeVisible();
  });

  it('should render with different appointment visibility', async () => {
    const overrides_contextWithVisibility = {
      zimbraPrefCalendarApptVisibility: 'private',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithVisibility));
    await expect.element(page.getByText('Default Appointment visibility')).toBeVisible();
  });

  it('should render with enabled mail signature', async () => {
    const overrides_contextWithSignature = { zimbraPrefMailSignatureEnabled: 'TRUE' };
    setupBrowserTest(wrapUserPref(overrides_contextWithSignature));
    await expect.element(page.getByText('Mail Signature')).toBeVisible();
  });

  it('should render with enabled read receipts feature', async () => {
    const overrides_contextWithReadReceipt = {
      zimbraFeatureReadReceiptsEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithReadReceipt));
    await expect.element(page.getByText('Allow the user to ask for a read receipt')).toBeVisible();
  });

  it('should render with enabled auto add contacts', async () => {
    const overrides_contextWithAutoAdd = { zimbraPrefAutoAddAddressEnabled: 'TRUE' };
    setupBrowserTest(wrapUserPref(overrides_contextWithAutoAdd));
    await expect.element(page.getByText('Enable auto-add contacts')).toBeVisible();
  });

  it('should render with enabled GAL autocomplete', async () => {
    const overrides_contextWithGal = {
      zimbraPrefGalAutoCompleteEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithGal));
    await expect.element(page.getByText('Use GAL to auto-fill')).toBeVisible();
  });

  it('should render with all calendar preferences enabled', async () => {
    const overrides_contextWithCalendar = {
      zimbraPrefCalendarShowPastDueReminders: 'TRUE',
      zimbraPrefCalendarAllowCancelEmailToSelf: 'TRUE',
      zimbraPrefCalendarAllowForwardedInvite: 'TRUE',
      zimbraPrefCalendarAllowPublishMethodInvite: 'TRUE',
      zimbraPrefCalendarAutoAddInvites: 'TRUE',
      zimbraPrefCalendarSendInviteDeniedAutoReply: 'TRUE',
      zimbraPrefCalendarNotifyDelegatedChanges: 'TRUE',
      zimbraPrefAppleIcalDelegationEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithCalendar));
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
  });

  it('should render without zimbraId in accountDetail', async () => {
    const overrides_contextWithoutId = { zimbraId: undefined };
    setupBrowserTest(wrapUserPref(overrides_contextWithoutId));
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
  });

  it('should render with different charset', async () => {
    const overrides_contextWithCharset = { zimbraPrefMailDefaultCharset: 'UTF-8' };
    setupBrowserTest(wrapUserPref(overrides_contextWithCharset));
    await expect.element(page.getByText('Default Charset')).toBeVisible();
  });

  it('should render with enabled out of office reply', async () => {
    const overrides_contextWithOOO = {
      zimbraPrefOutOfOfficeReplyEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithOOO));
    await expect.element(page.getByText('Can send auto-reply messages')).toBeVisible();
  });

  it('should render with enabled save to sent', async () => {
    const overrides_contextWithSaveToSent = { zimbraPrefSaveToSent: 'TRUE' };
    setupBrowserTest(wrapUserPref(overrides_contextWithSaveToSent));
    await expect.element(page.getByText('Save to sent')).toBeVisible();
  });

  it('should render with enabled message deduping', async () => {
    const overrides_contextWithDeduping = {
      zimbraPrefMessageIdDedupingEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithDeduping));
    await expect.element(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
  });

  it('should render with enabled mail toaster', async () => {
    const overrides_contextWithToaster = { zimbraPrefMailToasterEnabled: 'TRUE' };
    setupBrowserTest(wrapUserPref(overrides_contextWithToaster));
    await expect.element(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
  });

  it('should handle undefined zimbraPrefOutOfOfficeCacheDuration', async () => {
    const overrides_contextUndefined = {
      zimbraPrefOutOfOfficeCacheDuration: undefined,
    };
    setupBrowserTest(wrapUserPref(overrides_contextUndefined));
    await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
  });

  it('should render with varying boolean preferences as TRUE', async () => {
    const overrides_contextWithTrue = {
      zimbraPrefMessageViewHtmlPreferred: 'TRUE',
      zimbraPrefOutOfOfficeReplyEnabled: 'TRUE',
      zimbraPrefMailSignatureEnabled: 'TRUE',
      zimbraPrefAutoAddAddressEnabled: 'TRUE',
      zimbraPrefGalAutoCompleteEnabled: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_contextWithTrue));
    await expect.element(page.getByText('Mail Options')).toBeVisible();
  });

  it('should render with all sections visible', async () => {
    const overrides_fullContext = {
      zimbraId: 'test-id-123',
      zimbraPrefGroupMailBy: 'conversation',
      zimbraPrefMailDefaultCharset: 'UTF-8',
      zimbraPrefMailPollingInterval: '10m',
      zimbraPrefTimeZoneId: 'America/New_York',
      zimbraPrefCalendarDefaultApptDuration: '60m',
      zimbraPrefCalendarApptReminderWarningTime: '15',
      zimbraPrefCalendarInitialView: 'week',
      zimbraPrefCalendarFirstDayOfWeek: '1',
      zimbraPrefCalendarApptVisibility: 'public',
    };
    setupBrowserTest(wrapUserPref(overrides_fullContext));
    await expect.element(page.getByText('Mail Options')).toBeVisible();
    await expect.element(page.getByText('Receiving Mails')).toBeVisible();
    await expect.element(page.getByText('Sending Mails')).toBeVisible();
    await expect.element(page.getByText('Composing Mails')).toBeVisible();
    await expect.element(page.getByText('Contact Options')).toBeVisible();
    await expect.element(page.getByText('Calendar Options')).toBeVisible();
  });

  it('should render SignatureDetail component', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Mail Signature')).toBeVisible();
  });

  it('should render with empty signatures', async () => {
    setupBrowserTest(wrapUserPref());
    await expect.element(page.getByText('Mail Signature')).toBeVisible();
  });

  it('should render with all possible preference values set', async () => {
    const overrides_fullPrefsContext = {
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
      zimbraPrefSaveToSent: 'TRUE',
    };
    setupBrowserTest(wrapUserPref(overrides_fullPrefsContext));
    await expect.element(page.getByText('Mail Options')).toBeVisible();
  });

  it('should render with minimal accountDetail', async () => {
    setupBrowserTest(wrapUserPref({ zimbraId: 'min-test-id' }));
    await expect.element(page.getByText('Mail Options')).toBeVisible();
  });

  it('should handle different out of office cache duration with days', async () => {
    const overrides_testContext = {
      zimbraPrefOutOfOfficeCacheDuration: '1d',
    };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
  });

  it('should handle different out of office cache duration with hours', async () => {
    const overrides_testContext = {
      zimbraPrefOutOfOfficeCacheDuration: '24h',
    };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Out of office cache lifetime')).toBeVisible();
  });

  it('should render with read receipt option never', async () => {
    const overrides_testContext = { zimbraPrefMailSendReadReceipts: 'never' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
  });

  it('should render with read receipt option prompt', async () => {
    const overrides_testContext = {
      zimbraPrefMailSendReadReceipts: 'prompt',
    };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Read Receipt settings')).toBeVisible();
  });

  it('should render with polling interval 500', async () => {
    const overrides_testContext = { zimbraPrefMailPollingInterval: '500' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Check new mail every')).toBeVisible();
  });

  it('should render with polling interval 15m', async () => {
    const overrides_testContext = { zimbraPrefMailPollingInterval: '15m' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Check new mail every')).toBeVisible();
  });

  it('should render with calendar view day', async () => {
    const overrides_testContext = { zimbraPrefCalendarInitialView: 'day' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Default Calendar View')).toBeVisible();
  });

  it('should render with calendar view workWeek', async () => {
    const overrides_testContext = {
      zimbraPrefCalendarInitialView: 'workWeek',
    };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('Default Calendar View')).toBeVisible();
  });

  it('should render with first day of week as Tuesday', async () => {
    const overrides_testContext = { zimbraPrefCalendarFirstDayOfWeek: '2' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('The Week starts on')).toBeVisible();
  });

  it('should render with first day of week as Friday', async () => {
    const overrides_testContext = { zimbraPrefCalendarFirstDayOfWeek: '5' };
    setupBrowserTest(wrapUserPref(overrides_testContext));
    await expect.element(page.getByText('The Week starts on')).toBeVisible();
  });

  it('should update the form when zimbraFeatureReadReceiptsEnabled reset button is clicked', async () => {
    setupBrowserTest(wrapUserPref({ zimbraFeatureReadReceiptsEnabled: 'TRUE' }));

    const resetButton = page.getByTestId('reset-zimbraFeatureReadReceiptsEnabled');
    await expect.element(resetButton).toBeVisible();

    const readReceiptSwitch = page.getByRole('switch', {
      name: 'Allow the user to ask for a read receipt',
    });
    await expect.element(readReceiptSwitch).toHaveAttribute('aria-checked', 'true');

    await resetButton.click();

    await expect.element(readReceiptSwitch).toHaveAttribute('aria-checked', 'false');
  });
});
