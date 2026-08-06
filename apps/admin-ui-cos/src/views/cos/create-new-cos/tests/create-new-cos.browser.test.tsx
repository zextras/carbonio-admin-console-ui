/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CreateNewCos } from '../create-new-cos';

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return {
    ...actual,
    replaceHistory: vi.fn(),
  };
});

const replaceHistoryMock = vi.mocked(
  await import('@zextras/ui-shared').then((m) => m.replaceHistory),
);

const NEW_COS_ID = 'new-cos-123-abc';

const mockCreateCosResponse = {
  cos: [
    {
      id: NEW_COS_ID,
      name: 'testcos',
      a: [
        { n: 'zimbraId', _content: NEW_COS_ID },
        { n: 'cn', _content: 'testcos' },
      ],
    },
  ],
};

async function setupWizardTest(): Promise<void> {
  await setupBrowserTest(
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/:cosId/:operation" element={<div>Cos Detail</div>} />
      <Route path="/create-new-cos" element={<CreateNewCos />} />
    </Routes>,
    { initialRouterEntry: '/create-new-cos' },
  );
  await expect.element(page.getByText('Create New COS')).toBeVisible();
}

describe('CreateNewCos wizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering (step 1)', () => {
    it('renders the page title Create New COS', async () => {
      await setupWizardTest();
      await expect.element(page.getByText('Create New COS')).toBeVisible();
    });

    it('renders the General Information section header', async () => {
      await setupWizardTest();
      await expect.element(page.getByText('General Information').last()).toBeVisible();
    });

    it('renders the Class of service name input field', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByRole('textbox', { name: 'Class of service name' }))
        .toBeVisible();
    });

    it('renders the edition section description', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByText('Select the edition associated with this class of service'))
        .toBeVisible();
    });

    it('renders the Next button', async () => {
      await setupWizardTest();
      await expect.element(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });
  });

  describe('Next button state', () => {
    it('is always enabled, even when the cos name is empty', async () => {
      await setupWizardTest();
      await expect.element(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    });

    it('is enabled when a valid cos name is entered', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await expect.element(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    });

    it('remains enabled when the cos name is cleared', async () => {
      await setupWizardTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Class of service name' });
      await userEvent.fill(cosNameInput, 'testcos');
      await userEvent.clear(cosNameInput);
      await expect.element(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    });

    it('shows a validation error when Next is clicked with an empty cos name', async () => {
      await setupWizardTest();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByText('COS name is required')).toBeVisible();
    });

    it('does not advance to step 2 when Next is clicked with an invalid form', async () => {
      await setupWizardTest();
      await page.getByRole('button', { name: 'Next' }).click();

      expect(page.getByRole('button', { name: 'BACK' }).elements()).toHaveLength(0);
      await expect.element(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });
  });

  describe('Step navigation', () => {
    it('advances to step 2 when Next is clicked', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByRole('button', { name: 'BACK' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'create' })).toBeVisible();
    });

    it('returns to step 1 when Back is clicked', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect.element(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });

    it('keeps the entered cos name when navigating back', async () => {
      await setupWizardTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Class of service name' });
      await userEvent.fill(cosNameInput, 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect.element(cosNameInput).toHaveValue('testcos');
    });
  });

  describe('Edition selection', () => {
    it('selects Email edition by default', async () => {
      await setupWizardTest();
      await expect.element(page.getByRole('radio', { name: 'Email edition' })).toBeChecked();
    });

    it('allows switching to Workspace edition', async () => {
      await setupWizardTest();
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await expect.element(page.getByRole('radio', { name: 'Workspace edition' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Email edition' })).not.toBeChecked();
    });

    it('renders the email and workspace edition descriptions', async () => {
      await setupWizardTest();
      await expect
        .element(
          page.getByText('Includes email, mobile apps, push notifications, and real-time backup.'),
        )
        .toBeVisible();
      await expect
        .element(page.getByText('Everything in Email, plus Files & Docs and Chat & Video.'))
        .toBeVisible();
    });
  });

  describe('Cancel', () => {
    it('calls replaceHistory with / when Cancel is clicked', async () => {
      await setupWizardTest();
      await page.getByRole('button', { name: 'Cancel' }).click();
      expect(replaceHistoryMock).toHaveBeenCalledWith('/');
    });
  });

  describe('Step 2 content', () => {
    it('navigates back from workspace edition step 2 to step 1', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect.element(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });
  });

  describe('Step 2 - Workspace edition', () => {
    async function setupWorkspaceStep2(): Promise<void> {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
    }

    it('renders the features header title and description', async () => {
      await setupWorkspaceStep2();

      await expect
        .element(page.getByText('Choose which features to enable for this edition'))
        .toBeVisible();
      await expect
        .element(
          page.getByText(
            'All features are enabled by default. Pick what this Class of Service should include. You can always adjust individual features later.',
          ),
        )
        .toBeVisible();
    });

    it('renders all workspace edition feature switches', async () => {
      await setupWorkspaceStep2();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeVisible();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Contacts' }))
        .toBeVisible();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Calendar' }))
        .toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable files' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable mobile app' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable chats' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable video calls' })).toBeVisible();
    });

    it('renders section headers for each feature group', async () => {
      await setupWorkspaceStep2();

      await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Contacts', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Calendar', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Files', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Tasks', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Chats', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Video calls', { exact: true })).toBeVisible();
    });

    it('renders feature descriptions for Contacts, Calendar, Files, Chats, and Video calls', async () => {
      await setupWorkspaceStep2();

      await expect
        .element(page.getByText('Personal and shared address books on the web client.'))
        .toBeVisible();
      await expect
        .element(page.getByText('Calendars, appointments and scheduling on the web client.'))
        .toBeVisible();
      await expect
        .element(page.getByText('File storage and sharing on the web client.'))
        .toBeVisible();
      await expect
        .element(page.getByText('Messaging, group chats and file sharing between users.'))
        .toBeVisible();
      await expect
        .element(page.getByText('One-to-one and group video calls within Chats.'))
        .toBeVisible();
    });

    it('has all switches checked by default', async () => {
      await setupWorkspaceStep2();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeChecked();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Contacts' }))
        .toBeChecked();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Calendar' }))
        .toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable files' })).toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable mobile app' })).toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable chats' })).toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable video calls' })).toBeChecked();
    });

    it('toggles a feature when its switch is clicked', async () => {
      await setupWorkspaceStep2();

      const chatsSwitch = page.getByRole('switch', { name: 'Enable chats' });
      await expect.element(chatsSwitch).toBeChecked();
      await chatsSwitch.click();
      await expect.element(chatsSwitch).not.toBeChecked();
      await chatsSwitch.click();
      await expect.element(chatsSwitch).toBeChecked();
    });

    it('toggles workspace-only features (files, mobile app, video calls) individually', async () => {
      await setupWorkspaceStep2();

      const filesSwitch = page.getByRole('switch', { name: 'Enable files' });
      const mobileAppSwitch = page.getByRole('switch', { name: 'Enable mobile app' });
      const videoCallsSwitch = page.getByRole('switch', { name: 'Enable video calls' });

      await filesSwitch.click();
      await expect.element(filesSwitch).not.toBeChecked();
      await expect.element(mobileAppSwitch).toBeChecked();

      await mobileAppSwitch.click();
      await expect.element(mobileAppSwitch).not.toBeChecked();

      await videoCallsSwitch.click();
      await expect.element(videoCallsSwitch).not.toBeChecked();

      await filesSwitch.click();
      await mobileAppSwitch.click();
      await videoCallsSwitch.click();
      await expect.element(filesSwitch).toBeChecked();
      await expect.element(mobileAppSwitch).toBeChecked();
      await expect.element(videoCallsSwitch).toBeChecked();
    });

    it('toggles mail, contacts, calendar, and tasks features individually', async () => {
      await setupWorkspaceStep2();

      const mailSwitch = page.getByRole('switch', { name: 'Enable mail' });
      const contactsSwitch = page.getByRole('switch', { name: 'Users can access Contacts' });
      const calendarSwitch = page.getByRole('switch', { name: 'Users can access Calendar' });
      const tasksSwitch = page.getByRole('switch', { name: 'Enable tasks' });

      await mailSwitch.click();
      await expect.element(mailSwitch).not.toBeChecked();
      await expect.element(contactsSwitch).toBeChecked();

      await contactsSwitch.click();
      await calendarSwitch.click();
      await tasksSwitch.click();
      await expect.element(contactsSwitch).not.toBeChecked();
      await expect.element(calendarSwitch).not.toBeChecked();
      await expect.element(tasksSwitch).not.toBeChecked();

      await mailSwitch.click();
      await contactsSwitch.click();
      await calendarSwitch.click();
      await tasksSwitch.click();
      await expect.element(mailSwitch).toBeChecked();
      await expect.element(contactsSwitch).toBeChecked();
      await expect.element(calendarSwitch).toBeChecked();
      await expect.element(tasksSwitch).toBeChecked();
    });

    it('renders Back and Create buttons in footer', async () => {
      await setupWorkspaceStep2();

      await expect.element(page.getByRole('button', { name: 'BACK' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'create' })).toBeVisible();
    });
  });

  describe('Step 2 - Email edition', () => {
    async function setupEmailStep2(): Promise<void> {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
    }

    it('renders all email edition feature switches', async () => {
      await setupEmailStep2();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeVisible();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Contacts' }))
        .toBeVisible();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Calendar' }))
        .toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeVisible();
    });

    it('renders section headers for each feature group', async () => {
      await setupEmailStep2();

      await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Contacts', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Calendar', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Tasks', { exact: true })).toBeVisible();
    });

    it('renders feature descriptions for Contacts and Calendar', async () => {
      await setupEmailStep2();

      await expect
        .element(page.getByText('Personal and shared address books on the web client.'))
        .toBeVisible();
      await expect
        .element(page.getByText('Calendars, appointments and scheduling on the web client.'))
        .toBeVisible();
    });

    it('does not render workspace-only features', async () => {
      await setupEmailStep2();

      expect(page.getByRole('switch', { name: 'Enable files' }).elements()).toHaveLength(0);
      expect(page.getByRole('switch', { name: 'Enable mobile app' }).elements()).toHaveLength(0);
      expect(page.getByRole('switch', { name: 'Enable chats' }).elements()).toHaveLength(0);
      expect(page.getByRole('switch', { name: 'Enable video calls' }).elements()).toHaveLength(0);
    });

    it('has all switches checked by default', async () => {
      await setupEmailStep2();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeChecked();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Contacts' }))
        .toBeChecked();
      await expect
        .element(page.getByRole('switch', { name: 'Users can access Calendar' }))
        .toBeChecked();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeChecked();
    });

    it('toggles a feature when its switch is clicked', async () => {
      await setupEmailStep2();

      const mailSwitch = page.getByRole('switch', { name: 'Enable mail' });
      await expect.element(mailSwitch).toBeChecked();
      await mailSwitch.click();
      await expect.element(mailSwitch).not.toBeChecked();
      await mailSwitch.click();
      await expect.element(mailSwitch).toBeChecked();
    });

    it('toggles Contacts and Calendar features individually', async () => {
      await setupEmailStep2();

      const contactsSwitch = page.getByRole('switch', { name: 'Users can access Contacts' });
      const calendarSwitch = page.getByRole('switch', { name: 'Users can access Calendar' });

      await contactsSwitch.click();
      await expect.element(contactsSwitch).not.toBeChecked();
      await expect.element(calendarSwitch).toBeChecked();

      await calendarSwitch.click();
      await expect.element(calendarSwitch).not.toBeChecked();

      await contactsSwitch.click();
      await calendarSwitch.click();
      await expect.element(contactsSwitch).toBeChecked();
      await expect.element(calendarSwitch).toBeChecked();
    });

    it('toggles the Tasks feature', async () => {
      await setupEmailStep2();

      const tasksSwitch = page.getByRole('switch', { name: 'Enable tasks' });
      await expect.element(tasksSwitch).toBeChecked();
      await tasksSwitch.click();
      await expect.element(tasksSwitch).not.toBeChecked();
      await tasksSwitch.click();
      await expect.element(tasksSwitch).toBeChecked();
    });

    it('renders Back and Create buttons in footer', async () => {
      await setupEmailStep2();

      await expect.element(page.getByRole('button', { name: 'BACK' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'create' })).toBeVisible();
    });
  });

  describe('Field interactions (step 1)', () => {
    it('should type into the Description field', async () => {
      await setupWizardTest();
      const descInput = page.getByRole('textbox', { name: 'Description' });
      await userEvent.fill(descInput, 'A description');
      await expect.element(descInput).toHaveValue('A description');
    });

    it('should type into the Notes field', async () => {
      await setupWizardTest();
      const notesInput = page.getByRole('textbox', { name: 'Notes' });
      await userEvent.fill(notesInput, 'Some notes');
      await expect.element(notesInput).toHaveValue('Some notes');
    });

    it('auto-lowercases uppercase letters as the cos name is typed', async () => {
      await setupWizardTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Class of service name' });
      await userEvent.fill(cosNameInput, 'TestCOS');
      await expect.element(cosNameInput).toHaveValue('testcos');
    });

    it('allows hyphens in the cos name and advances to step 2', async () => {
      await setupWizardTest();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Class of service name' }),
        'test-cos',
      );
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByRole('button', { name: 'BACK' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'create' })).toBeVisible();
    });

    it('shows a lowercase validation error when the cos name contains disallowed characters', async () => {
      await setupWizardTest();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Class of service name' }),
        'test_cos',
      );
      await page.getByRole('button', { name: 'Next' }).click();

      await expect
        .element(page.getByText('COS name must contain only lowercase letters and hyphens'))
        .toBeVisible();
    });

    it('shows a required validation error when the cos name is cleared after a failed submit', async () => {
      worker.use(
        http.post('/service/admin/soap/CreateCosRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Submit failed' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      await expect.element(page.getByText('Submit failed')).toBeVisible();
      await page.getByRole('button', { name: 'BACK' }).click();

      const cosNameInput = page.getByRole('textbox', { name: 'Class of service name' });
      await userEvent.clear(cosNameInput);

      await expect.element(page.getByText('COS name is required')).toBeVisible();
    });
  });

  describe('Create COS', () => {
    it('should send CreateCos SOAP request and navigate on successful creation', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as Record<string, unknown>;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.name).toEqual({ _content: 'testcos' });

      await expect.element(page.getByText('testcos has been created successfully')).toBeVisible();
      expect(replaceHistoryMock).toHaveBeenCalledWith(`/${NEW_COS_ID}/general_information`);
    });

    it('should include description and notes in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await userEvent.fill(page.getByRole('textbox', { name: 'Description' }), 'A test COS');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notes' }), 'Some notes');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const cnAttr = requestBody.a.find((a) => a.n === 'cn');
      const descAttr = requestBody.a.find((a) => a.n === 'description');
      const notesAttr = requestBody.a.find((a) => a.n === 'zimbraNotes');
      expect(cnAttr?._content).toBe('testcos');
      expect(descAttr?._content).toBe('A test COS');
      expect(notesAttr?._content).toBe('Some notes');
    });

    it('should include edition as email in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const editionAttr = requestBody.a.find((a) => a.n === 'edition');
      expect(editionAttr?._content).toBe('mail');
    });

    it('should include edition as workspace in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const editionAttr = requestBody.a.find((a) => a.n === 'edition');
      expect(editionAttr?._content).toBe('workspace');
    });

    it('should show error snackbar when CreateCos fails', async () => {
      worker.use(
        http.post('/service/admin/soap/CreateCosRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error occurred' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      await expect.element(page.getByText('Server error occurred')).toBeVisible();
    });

    it('navigates to / when the CreateCos response has an empty cos array', async () => {
      createBrowserSoapAPIInterceptor('CreateCos', { cos: [] });
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      await expect.element(page.getByText('testcos has been created successfully')).toBeVisible();
      expect(replaceHistoryMock).toHaveBeenCalledWith('/');
    });

    it('includes all email feature attributes as TRUE in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const getAttr = (name: string): string | undefined =>
        requestBody.a.find((a) => a.n === name)?._content;
      expect(getAttr('carbonioFeatureMailsAppEnabled')).toBe('TRUE');
      expect(getAttr('zimbraFeatureContactsEnabled')).toBe('TRUE');
      expect(getAttr('zimbraFeatureCalendarEnabled')).toBe('TRUE');
      expect(getAttr('carbonioFeatureTasksEnabled')).toBe('TRUE');
    });

    it('includes all workspace feature attributes as TRUE in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const getAttr = (name: string): string | undefined =>
        requestBody.a.find((a) => a.n === name)?._content;
      expect(getAttr('carbonioFeatureMailsAppEnabled')).toBe('TRUE');
      expect(getAttr('zimbraFeatureContactsEnabled')).toBe('TRUE');
      expect(getAttr('zimbraFeatureCalendarEnabled')).toBe('TRUE');
      expect(getAttr('carbonioFeatureFilesEnabled')).toBe('TRUE');
      expect(getAttr('carbonioFeatureFilesAppEnabled')).toBe('TRUE');
      expect(getAttr('carbonioFeatureTasksEnabled')).toBe('TRUE');
      expect(getAttr('carbonioFeatureWscEnabled')).toBe('TRUE');
      expect(getAttr('carbonioWscVideoCallEnabled')).toBe('TRUE');
    });

    it('includes toggled feature attributes as FALSE in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('switch', { name: 'Enable mail' }).click();
      await page.getByRole('switch', { name: 'Enable tasks' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const getAttr = (name: string): string | undefined =>
        requestBody.a.find((a) => a.n === name)?._content;
      expect(getAttr('carbonioFeatureMailsAppEnabled')).toBe('FALSE');
      expect(getAttr('carbonioFeatureTasksEnabled')).toBe('FALSE');
      expect(getAttr('zimbraFeatureContactsEnabled')).toBe('TRUE');
    });
  });

  describe('Feature items without descriptions', () => {
    it('renders Mail and Tasks without description text on email edition', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeVisible();
      expect(page.getByText('File storage and sharing on the web client.').elements()).toHaveLength(
        0,
      );
    });

    it('renders Mail, Tasks, and Mobile app without description text on workspace edition', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByRole('switch', { name: 'Enable mail' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable tasks' })).toBeVisible();
      await expect.element(page.getByRole('switch', { name: 'Enable mobile app' })).toBeVisible();
    });
  });

  describe('Footer & navigation', () => {
    it('has the create button enabled on step 2 when the form is valid', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();

      await expect.element(page.getByRole('button', { name: 'create' })).not.toBeDisabled();
    });

    it('navigates to / when Cancel is clicked from step 2', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      expect(replaceHistoryMock).toHaveBeenCalledWith('/');
    });

    it('keeps workspace edition selected when navigating back from step 2 to step 1', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Class of service name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect.element(page.getByRole('radio', { name: 'Workspace edition' })).toBeChecked();
      await expect.element(page.getByRole('radio', { name: 'Email edition' })).not.toBeChecked();
    });
  });
});
