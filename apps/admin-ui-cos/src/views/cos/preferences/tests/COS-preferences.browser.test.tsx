/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  delayedSoapApiForBrowser,
  getQueryClient,
  grantUserCosRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type ModifyCosBody } from '../../../../services/modify-cos-service';
import { COSPreferences } from '../cos-preferences';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      isDefaultCos: true,
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'zimbraPrefLocale', _content: 'en' },
        { n: 'zimbraFeatureReadReceiptsEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefMailSendReadReceipts', _content: 'never' },
        { n: 'zimbraPrefMessageViewHtmlPreferred', _content: 'FALSE' },
        { n: 'zimbraPrefGroupMailBy', _content: 'conversation' },
        { n: 'zimbraPrefMailDefaultCharset', _content: 'UTF-8' },
        { n: 'zimbraPrefMessageIdDedupingEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefMailToasterEnabled', _content: 'FALSE' },
        { n: 'zimbraFileUploadMaxSizePerFile', _content: '2147483648' },
        { n: 'zimbraMailMinPollingInterval', _content: '2m' },
        { n: 'zimbraPrefMailPollingInterval', _content: '500' },
        { n: 'zimbraPrefSaveToSent', _content: 'TRUE' },
        { n: 'zimbraFeatureMailForwardingEnabled', _content: 'FALSE' },
        { n: 'zimbraFeatureMailForwardingInFiltersEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefAutoAddAddressEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefGalAutoCompleteEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefTimeZoneId', _content: 'America/New_York' },
        { n: 'zimbraPrefCalendarDefaultApptDuration', _content: '60m' },
        { n: 'zimbraPrefCalendarApptReminderWarningTime', _content: '15' },
        { n: 'zimbraPrefCalendarInitialView', _content: 'week' },
        { n: 'zimbraPrefCalendarFirstDayOfWeek', _content: '0' },
        { n: 'zimbraPrefCalendarApptVisibility', _content: 'public' },
        { n: 'zimbraPrefCalendarShowPastDueReminders', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarAllowCancelEmailToSelf', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarAllowForwardedInvite', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarAllowPublishMethodInvite', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarAutoAddInvites', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarSendInviteDeniedAutoReply', _content: 'FALSE' },
        { n: 'zimbraPrefCalendarNotifyDelegatedChanges', _content: 'FALSE' },
        { n: 'zimbraPrefAppleIcalDelegationEnabled', _content: 'FALSE' },
      ],
    },
  ],
};

async function setupCosPreferencesTest(cosData = mockCosData) {
  createBrowserSoapAPIInterceptor('GetCos', cosData);
  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<COSPreferences />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/preferences`, grantRights: 'cos' },
  );
  await expect.element(page.getByText('Preferences')).toBeVisible();
}

async function expectGeneralOptionsSectionVisible() {
  await expect.element(page.getByText('General Options')).toBeVisible();
  await expect.element(page.getByText('English - English')).toBeVisible();
  await expect.element(page.getByText('Language')).toBeVisible();
}

async function expectMailOptionsSectionVisible() {
  await expect.element(page.getByText('Mail Options')).toBeVisible();
  await expect.element(page.getByText('View mail as HTML (when possible)')).toBeVisible();
  await expect.element(page.getByText('Display by')).toBeVisible();
  await expect.element(page.getByText('Conversation', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Default Charset')).toBeVisible();
  await expect.element(page.getByText('Auto-Delete duplicate messages')).toBeVisible();
  await expect.element(page.getByText('Enable New Mail Toast Notification')).toBeVisible();
  await expect
    .element(page.getByText('Maximum size (bytes) allowed for each attachment'))
    .toBeVisible();
  await expect.element(page.getByText('~2 GB')).toBeVisible();
}

async function expectReceivingMailsSectionVisible() {
  await expect.element(page.getByText('Receiving Mails')).toBeVisible();
  await expect.element(page.getByText('Minimum mail polling interval')).toBeVisible();
  await expect.element(page.getByText('Days / Hours / Minutes / Sec')).toBeVisible();
  await expect.element(page.getByText('Polling interval', { exact: true })).toBeVisible();
}

async function expectForwardingSectionVisible() {
  await expect.element(page.getByText('Forwarding', { exact: true })).toBeVisible();
  await expect.element(page.getByText('User can specify forwarding address')).toBeVisible();
  await expect.element(page.getByText('User can specify mail forwarding filter')).toBeVisible();
}

async function expectSendingMailsSectionVisible() {
  await expect.element(page.getByText('Sending Mails')).toBeVisible();
  await expect.element(page.getByText('Save to sent')).toBeVisible();
  await expect.element(page.getByText('Allow the user to ask for a read receipt')).toBeVisible();
}

async function expectContactOptionsSectionVisible() {
  await expect.element(page.getByText('Contact Options')).toBeVisible();
  await expect.element(page.getByText('Enable auto-add contacts')).toBeVisible();
  await expect.element(page.getByText('Use GAL to auto-fill')).toBeVisible();
}

async function expectCalendarOptionsVisible() {
  await expect.element(page.getByText('Calendar Options')).toBeVisible();
  await expect.element(page.getByText('Time Zone')).toBeVisible();
  await expect
    .element(
      page
        .getByText(/Appointment/)
        .filter({ hasText: /Default Duration/ }),
    )
    .toBeVisible();
  await expect.element(page.getByText('Appointment Reminder (minutes before)')).toBeVisible();
  await expect.element(page.getByText('Default Calendar View')).toBeVisible();
  await expect.element(page.getByText('The Week starts on')).toBeVisible();
  await expect.element(page.getByText('Default appointment visibility')).toBeVisible();
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
}

describe('COSPreferences', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the component correctly', async () => {
      await setupCosPreferencesTest();
      await expect.element(page.getByText('General Options')).toBeVisible();
      await expectGeneralOptionsSectionVisible();
      await expectMailOptionsSectionVisible();
      await expectReceivingMailsSectionVisible();
      await expectForwardingSectionVisible();
      await expectSendingMailsSectionVisible();
      await expectContactOptionsSectionVisible();
      await expectCalendarOptionsVisible();
    }, 20_000);

    it('should render with default values when cos data has no attributes', async () => {
      const minimalCosData = {
        cos: [
          {
            id: COS_ID,
            name: 'empty',
            isDefaultCos: false,
            a: [{ n: 'zimbraId', _content: COS_ID }],
          },
        ],
      };
      await setupCosPreferencesTest(minimalCosData);
      await expect.element(page.getByText('Preferences')).toBeVisible();
      await expect.element(page.getByText('General Options')).toBeVisible();
      await expect.element(page.getByText('Mail Options')).toBeVisible();
    }, 20_000);
  });

  describe('Loading', () => {
    it('should show loading shimmer when data is pending', async () => {
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      delayedSoapApiForBrowser('GetCos', mockCosData, 5000);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<COSPreferences />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/preferences`, queryClient },
      );

      await expect.element(page.getByRole('status')).toBeVisible();
    }, 20_000);
  });

  describe('Dirty state', () => {
    it('should not show Save and Cancel buttons initially', async () => {
      await setupCosPreferencesTest();
      await expect
        .element(page.getByRole('button', { name: 'Save' }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: 'Cancel' }))
        .not.toBeInTheDocument();
    });

    it('should show Save and Cancel buttons after toggling a switch', async () => {
      await setupCosPreferencesTest();
      const viewHtmlSwitch = page.getByRole('switch', { name: 'View mail as HTML (when possible)' });
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await viewHtmlSwitch.click();
      await expect.element(viewHtmlSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should restore initial values when Cancel is clicked', async () => {
      await setupCosPreferencesTest();
      const viewHtmlSwitch = page.getByRole('switch', { name: 'View mail as HTML (when possible)' });
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await viewHtmlSwitch.click();
      await expect.element(viewHtmlSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await expect
        .element(page.getByRole('button', { name: 'Save' }))
        .not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should send ModifyCos with correct body when saving', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();

      await page.getByText('View mail as HTML (when possible)').click();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.id._content).toBe(COS_ID);
      const toggledAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraPrefMessageViewHtmlPreferred',
      );
      expect(toggledAttr).toBeDefined();
      expect(toggledAttr!._content).toBe('TRUE');
    }, 20_000);

    it('should send FlushCache after saving', async () => {
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      const flushCachePromise = createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();

      await page.getByText('View mail as HTML (when possible)').click();
      await page.getByRole('button', { name: 'Save' }).click();

      const flushBody = await flushCachePromise;
      expect(flushBody).toBeDefined();
    }, 20_000);

    it('should include all COS preference attributes in ModifyCos body', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();

      await page.getByText('View mail as HTML (when possible)').click();
      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const attributeNames = requestBody.a.map((a: { n: string }) => a.n);
      expect(attributeNames).toContain('zimbraPrefLocale');
      expect(attributeNames).toContain('zimbraPrefMessageViewHtmlPreferred');
      expect(attributeNames).toContain('zimbraPrefGroupMailBy');
      expect(attributeNames).toContain('zimbraPrefMailDefaultCharset');
      expect(attributeNames).toContain('zimbraFileUploadMaxSizePerFile');
      expect(attributeNames).toContain('zimbraPrefCalendarFirstDayOfWeek');
    }, 20_000);

  });

  describe('Read-only mode', () => {
    it('should not show Save button when clicking switches without setAttrs rights', async () => {
      const queryClient = getQueryClient();
      queryClient.setQueryData(['account', 'info'], {
        id: 'test-user-id',
        name: 'test@example.com',
        displayName: '',
        signatures: { signature: [] },
        identities: undefined,
        rights: { targets: [] },
      });
      queryClient.setQueryData(['effective-rights', 'test@example.com'], [
        {
          type: 'cos',
          all: [
            {
              right: [{ n: 'listCos' }],
              getAttrs: [{ all: true }],
            },
          ],
        },
      ]);

      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<COSPreferences />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/preferences`, queryClient },
      );
      await expect.element(page.getByText('Preferences')).toBeVisible();

      await page.getByText('View mail as HTML (when possible)').click();
      await expect
        .element(page.getByRole('button', { name: 'Save' }))
        .not.toBeInTheDocument();
    }, 20_000);
  });

  describe('General Options interactions', () => {
    it('should mark as dirty when changing the Language select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Language').click();
      await page.getByText('Dutch - Nederlands').click();
      await expect.element(page.getByText('Dutch - Nederlands')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);
  });

  describe('Mail Options interactions', () => {
    it('should mark as dirty when toggling View mail as HTML', async () => {
      await setupCosPreferencesTest();
      const viewHtmlSwitch = page.getByRole('switch', { name: 'View mail as HTML (when possible)' });
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await viewHtmlSwitch.click();
      await expect.element(viewHtmlSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when changing Display by select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Display by').click();
      const messageOption = page.getByText('Message', { exact: true }).first();
      await messageOption.click();
      await expect.element(page.getByText('Message', { exact: true })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing Default Charset select', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();
      await page.getByText('Default Charset').click();
      await page.getByText('KOI8-R').click();
      await expect.element(page.getByText('KOI8-R')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when toggling Auto-Delete duplicate messages', async () => {
      await setupCosPreferencesTest();
      const autoDeleteSwitch = page.getByRole('switch', { name: 'Auto-Delete duplicate messages' });
      await expect.element(autoDeleteSwitch).not.toBeChecked();
      await autoDeleteSwitch.click();
      await expect.element(autoDeleteSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Enable New Mail Toast Notification', async () => {
      await setupCosPreferencesTest();
      const toastNotificationSwitch = page.getByRole('switch', { name: 'Enable New Mail Toast Notification' });
      await expect.element(toastNotificationSwitch).not.toBeChecked();
      await toastNotificationSwitch.click();
      await expect.element(toastNotificationSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when changing attachment max size', async () => {
      await setupCosPreferencesTest();
      const attachmentInput = page.getByLabelText(
        'Maximum size (bytes) allowed for each attachment',
      );
      await expect.element(attachmentInput).toBeVisible();
      await attachmentInput.clear();
      await attachmentInput.fill('1073741824');
      await expect.element(attachmentInput).toHaveValue(1073741824);
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should display Unlimited when attachment max size is 0', async () => {
      const cosDataWithZeroSize = {
        cos: [
          {
            ...mockCosData.cos[0],
            a: mockCosData.cos[0].a.map((attr: { n: string; _content: string }) =>
              attr.n === 'zimbraFileUploadMaxSizePerFile' ? { ...attr, _content: '0' } : attr,
            ),
          },
        ],
      };
      await setupCosPreferencesTest(cosDataWithZeroSize);
      await expect.element(page.getByText('Unlimited')).toBeVisible();
    }, 20_000);
  });

  describe('Receiving Mails interactions', () => {
    it('should mark as dirty when changing Read Receipt settings select', async () => {
      await setupCosPreferencesTest();
      const readReceiptSettingsLabel = page.getByText('Read Receipt settings');
      await expect.element(readReceiptSettingsLabel).toBeVisible();
      await readReceiptSettingsLabel.click();
      await page.getByText('Always send a read receipt').click();
      await expect.element(page.getByText('Always send a read receipt')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when changing Polling interval select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Polling interval', { exact: true }).click();
      await page.getByText('10 minutes').click();
      await expect.element(page.getByText('10 minutes')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);
  });

  describe('Forwarding interactions', () => {
    it('should mark as dirty when toggling User can specify forwarding address', async () => {
      await setupCosPreferencesTest();
      const forwardingAddressSwitch = page.getByRole('switch', { name: 'User can specify forwarding address' });
      await expect.element(forwardingAddressSwitch).not.toBeChecked();
      await forwardingAddressSwitch.click();
      await expect.element(forwardingAddressSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling User can specify mail forwarding filter', async () => {
      await setupCosPreferencesTest();
      const forwardingFilterSwitch = page.getByRole('switch', { name: 'User can specify mail forwarding filter' });
      await expect.element(forwardingFilterSwitch).not.toBeChecked();
      await forwardingFilterSwitch.click();
      await expect.element(forwardingFilterSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Sending Mails interactions', () => {
    it('should mark as dirty when toggling Save to sent', async () => {
      await setupCosPreferencesTest();
      const saveToSentSwitch = page.getByRole('switch', { name: 'Save to sent' });
      await expect.element(saveToSentSwitch).toBeChecked();
      await saveToSentSwitch.click();
      await expect.element(saveToSentSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Allow the user to ask for a read receipt', async () => {
      await setupCosPreferencesTest();
      const readReceiptSwitch = page.getByRole('switch', {
        name: 'Allow the user to ask for a read receipt',
      });
      await expect.element(readReceiptSwitch).not.toBeChecked();
      await readReceiptSwitch.click();
      await expect.element(readReceiptSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Contact Options interactions', () => {
    it('should mark as dirty when toggling Enable auto-add contacts', async () => {
      await setupCosPreferencesTest();
      const autoAddContactsSwitch = page.getByRole('switch', { name: 'Enable auto-add contacts' });
      await expect.element(autoAddContactsSwitch).not.toBeChecked();
      await autoAddContactsSwitch.click();
      await expect.element(autoAddContactsSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Use GAL to auto-fill', async () => {
      await setupCosPreferencesTest();
      const galAutoFillSwitch = page.getByRole('switch', { name: 'Use GAL to auto-fill' });
      await expect.element(galAutoFillSwitch).not.toBeChecked();
      await galAutoFillSwitch.click();
      await expect.element(galAutoFillSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Calendar Options interactions', () => {
    it('should mark as dirty when changing Time Zone select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Time Zone').click();
      await page.getByText('GMT +01:00 Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna').click();
      await expect
        .element(page.getByText('GMT +01:00 Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing Appointment Duration select', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();
      const apptDurationLabel = page
        .getByText(/Appointment/)
        .filter({ hasText: /Default Duration/ });
      await apptDurationLabel.click();
      const option90 = page.getByText('90 minutes', { exact: true }).first();
      await option90.click();
      await expect.element(page.getByText('90 minutes', { exact: true })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing Appointment Reminder select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Appointment Reminder (minutes before)').click();
      await page.getByText('30').click();
      await expect.element(page.getByText('30')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing Default Calendar View select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Default Calendar View').click();
      await page.getByText('Day View').click();
      await expect.element(page.getByText('Day View')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing The Week starts on select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('The Week starts on').click();
      await page.getByText('Monday').click();
      await expect.element(page.getByText('Monday')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when changing Default appointment visibility select', async () => {
      await setupCosPreferencesTest();
      await page.getByText('Default appointment visibility').click();
      await page.getByText('Private').click();
      await expect.element(page.getByText('Private')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);

    it('should mark as dirty when toggling Enable reminders of appointments in the past', async () => {
      await setupCosPreferencesTest();
      const pastRemindersSwitch = page.getByRole('switch', {
        name: 'Enable reminders of appointments in the past',
      });
      await expect.element(pastRemindersSwitch).not.toBeChecked();
      await pastRemindersSwitch.click();
      await expect.element(pastRemindersSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Allow sending cancellation mail', async () => {
      await setupCosPreferencesTest();
      const cancelEmailSwitch = page.getByRole('switch', { name: 'Allow sending cancellation mail' });
      await expect.element(cancelEmailSwitch).not.toBeChecked();
      await cancelEmailSwitch.click();
      await expect.element(cancelEmailSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Automatically add forwarded appointments', async () => {
      await setupCosPreferencesTest();
      const forwardedApptsSwitch = page.getByRole('switch', {
        name: 'Automatically add forwarded appointments to the calendar',
      });
      await expect.element(forwardedApptsSwitch).not.toBeChecked();
      await forwardedApptsSwitch.click();
      await expect.element(forwardedApptsSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Add invites with PUBLISH method', async () => {
      await setupCosPreferencesTest();
      const publishInviteSwitch = page.getByRole('switch', { name: 'Add invites with PUBLISH method' });
      await expect.element(publishInviteSwitch).not.toBeChecked();
      await publishInviteSwitch.click();
      await expect.element(publishInviteSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Automatically add appointments when invited', async () => {
      await setupCosPreferencesTest();
      const autoAddInvitesSwitch = page.getByRole('switch', {
        name: 'Automatically add appointments when the user is invited',
      });
      await expect.element(autoAddInvitesSwitch).not.toBeChecked();
      await autoAddInvitesSwitch.click();
      await expect.element(autoAddInvitesSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Auto-decline if the sender is blacklisted', async () => {
      await setupCosPreferencesTest();
      const autoDeclineSwitch = page.getByRole('switch', {
        name: 'Auto-decline if the sender is blacklisted',
      });
      await expect.element(autoDeclineSwitch).not.toBeChecked();
      await autoDeclineSwitch.click();
      await expect.element(autoDeclineSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Notify changes made by delegated accounts', async () => {
      await setupCosPreferencesTest();
      const delegatedNotifySwitch = page.getByRole('switch', {
        name: 'Notify changes made by delegated accounts',
      });
      await expect.element(delegatedNotifySwitch).not.toBeChecked();
      await delegatedNotifySwitch.click();
      await expect.element(delegatedNotifySwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Use iCal delegation model', async () => {
      await setupCosPreferencesTest();
      const iCalDelegationSwitch = page.getByRole('switch', {
        name: 'Use iCal delegation model for shared calendars',
      });
      await expect.element(iCalDelegationSwitch).not.toBeChecked();
      await iCalDelegationSwitch.click();
      await expect.element(iCalDelegationSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Multiple interactions', () => {
    it('should track multiple switch changes in a single save', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();

      await page.getByText('View mail as HTML (when possible)').click();
      await page.getByText('Save to sent').click();
      await page.getByText('Enable auto-add contacts').click();

      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const htmlPref = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraPrefMessageViewHtmlPreferred',
      );
      const saveToSent = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraPrefSaveToSent',
      );
      const autoAdd = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraPrefAutoAddAddressEnabled',
      );
      expect(htmlPref!._content).toBe('TRUE');
      expect(saveToSent!._content).toBe('FALSE');
      expect(autoAdd!._content).toBe('TRUE');
    }, 20_000);

    it('should cancel and allow re-editing after cancel', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosPreferencesTest();
      const viewHtmlSwitch = page.getByRole('switch', { name: 'View mail as HTML (when possible)' });
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await viewHtmlSwitch.click();
      await expect.element(viewHtmlSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect.element(viewHtmlSwitch).not.toBeChecked();
      await expect
        .element(page.getByRole('button', { name: 'Save' }))
        .not.toBeInTheDocument();

      const saveToSentSwitch = page.getByRole('switch', { name: 'Save to sent' });
      await expect.element(saveToSentSwitch).toBeChecked();
      await saveToSentSwitch.click();
      await expect.element(saveToSentSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    }, 20_000);
  });

  describe('Switch round-trip toggles (both directions)', () => {
    it('should toggle Mail Options switches FALSE→TRUE→FALSE', async () => {
      await setupCosPreferencesTest();
      const labels = [
        'View mail as HTML (when possible)',
        'Auto-Delete duplicate messages',
        'Enable New Mail Toast Notification',
      ];
      for (const label of labels) {
        const switchElement = page.getByRole('switch', { name: label });
        await expect.element(switchElement).not.toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).not.toBeChecked();
      }
    }, 20_000);

    it('should toggle Forwarding switches FALSE→TRUE→FALSE', async () => {
      await setupCosPreferencesTest();
      const labels = [
        'User can specify forwarding address',
        'User can specify mail forwarding filter',
      ];
      for (const label of labels) {
        const switchElement = page.getByRole('switch', { name: label });
        await expect.element(switchElement).not.toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).not.toBeChecked();
      }
    });

    it('should toggle Sending Mails switches in both directions', async () => {
      await setupCosPreferencesTest();
      const saveToSentSwitch = page.getByRole('switch', { name: 'Save to sent' });
      await expect.element(saveToSentSwitch).toBeChecked();
      await saveToSentSwitch.click();
      await expect.element(saveToSentSwitch).not.toBeChecked();
      await saveToSentSwitch.click();
      await expect.element(saveToSentSwitch).toBeChecked();

      const readReceiptSwitch = page.getByRole('switch', {
        name: 'Allow the user to ask for a read receipt',
      });
      await expect.element(readReceiptSwitch).not.toBeChecked();
      await readReceiptSwitch.click();
      await expect.element(readReceiptSwitch).toBeChecked();
      await readReceiptSwitch.click();
      await expect.element(readReceiptSwitch).not.toBeChecked();
    });

    it('should toggle Contact Options switches FALSE→TRUE→FALSE', async () => {
      await setupCosPreferencesTest();
      const labels = ['Enable auto-add contacts', 'Use GAL to auto-fill'];
      for (const label of labels) {
        const switchElement = page.getByRole('switch', { name: label });
        await expect.element(switchElement).not.toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).not.toBeChecked();
      }
    });

    it('should toggle all Calendar Options switches FALSE→TRUE→FALSE', async () => {
      await setupCosPreferencesTest();
      const labels = [
        'Enable reminders of appointments in the past',
        'Allow sending cancellation mail',
        'Automatically add forwarded appointments to the calendar',
        'Add invites with PUBLISH method',
        'Automatically add appointments when the user is invited',
        'Auto-decline if the sender is blacklisted',
        'Notify changes made by delegated accounts',
        'Use iCal delegation model for shared calendars',
      ];
      for (const label of labels) {
        const switchElement = page.getByRole('switch', { name: label });
        await expect.element(switchElement).not.toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).toBeChecked();
        await switchElement.click();
        await expect.element(switchElement).not.toBeChecked();
      }
    }, 20_000);
  });
});
