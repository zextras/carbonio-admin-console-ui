/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  grantUserCosRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { COSPreferences } from '../COSPreferences';

const mockCosData = {
  cos: [
    {
      id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
      name: 'default',
      isDefaultCos: true,
      a: [
        { n: 'zimbraId', _content: 'e00428a1-0c00-11d9-836a-000d93afea2a' },
        { n: 'zimbraPrefLocale', _content: 'en' },
        { n: 'zimbraFeatureReadReceiptsEnabled', _content: 'FALSE' },
        { n: 'zimbraPrefMailSendReadReceipts', _content: 'never' },
      ],
    },
  ],
};

async function setupCosPreferencesTest() {
  createBrowserSoapAPIInterceptor('GetCos', mockCosData);
  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<COSPreferences />} />
    </Routes>,
    { initialRouterEntry: '/e00428a1-0c00-11d9-836a-000d93afea2a/preferences' },
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
  await expect.element(page.getByText('Message', { exact: true })).toBeVisible();
  await expect.element(page.getByText('Default Charset')).toBeVisible();
  await expect.element(page.getByText('Big5')).toBeVisible();
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
  await expect.element(page.getByText("Appointment's Default Duration")).toBeVisible();
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
    grantUserCosRights();
  });

  afterEach(() => {
    resetMockWorker();
  });

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
  it('should toggle zimbraFeatureReadReceiptsEnabled when clicking the read receipt switch', async () => {
    await setupCosPreferencesTest();

    await expect.element(page.getByText('Sending Mails')).toBeVisible();

    const readReceiptLabel = page.getByText('Allow the user to ask for a read receipt');
    await expect.element(readReceiptLabel).toBeVisible();

    await readReceiptLabel.click();

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect.element(saveButton).toBeVisible();
  });

  it('should change zimbraPrefMailSendReadReceipts when selecting a different option', async () => {
    await setupCosPreferencesTest();

    await expect.element(page.getByText('Receiving Mails')).toBeVisible();

    const readReceiptSettingsLabel = page.getByText('Read Receipt settings');
    await expect.element(readReceiptSettingsLabel).toBeVisible();

    await readReceiptSettingsLabel.click();

    const alwaysSendOption = page.getByText('Always send a read receipt');
    await alwaysSendOption.click();

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect.element(saveButton).toBeVisible();
  });
});

