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
  await expect.element(page.getByText('New COS')).toBeVisible();
}

describe('CreateNewCos wizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering (step 1)', () => {
    it('renders the page title New COS', async () => {
      await setupWizardTest();
      await expect.element(page.getByText('New COS')).toBeVisible();
    });

    it('renders the General Information section header', async () => {
      await setupWizardTest();
      // "General Information" appears twice: in the stepper (first) and as the
      // section title (second). The section title is the latter.
      await expect
        .element(page.getByText('General Information').last())
        .toBeVisible();
    });

    it('renders the Cos Name input field', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByRole('textbox', { name: 'Cos Name' }))
        .toBeVisible();
    });

    it('renders the Next button', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .toBeVisible();
    });
  });

  describe('Next button state', () => {
    it('is disabled when the cos name is empty', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .toBeDisabled();
    });

    it('is enabled when a valid cos name is entered', async () => {
      await setupWizardTest();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Cos Name' }),
        'testcos',
      );
      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .not.toBeDisabled();
    });

    it('is disabled again when the cos name is cleared', async () => {
      await setupWizardTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await userEvent.fill(cosNameInput, 'testcos');
      await userEvent.clear(cosNameInput);
      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .toBeDisabled();
    });
  });

  describe('Step navigation', () => {
    it('advances to step 2 when Next is clicked', async () => {
      await setupWizardTest();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Cos Name' }),
        'testcos',
      );
      await page.getByRole('button', { name: 'Next' }).click();

      await expect
        .element(page.getByRole('button', { name: 'BACK' }))
        .toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'create' }))
        .toBeVisible();
    });

    it('returns to step 1 when Back is clicked', async () => {
      await setupWizardTest();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Cos Name' }),
        'testcos',
      );
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .toBeVisible();
    });

    it('keeps the entered cos name when navigating back', async () => {
      await setupWizardTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await userEvent.fill(cosNameInput, 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect.element(cosNameInput).toHaveValue('testcos');
    });
  });

  describe('Edition selection', () => {
    it('selects Email edition by default', async () => {
      await setupWizardTest();
      await expect
        .element(page.getByRole('radio', { name: 'Email edition' }))
        .toBeChecked();
    });

    it('allows switching to Workspace edition', async () => {
      await setupWizardTest();
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await expect
        .element(page.getByRole('radio', { name: 'Workspace edition' }))
        .toBeChecked();
      await expect
        .element(page.getByRole('radio', { name: 'Email edition' }))
        .not.toBeChecked();
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
    it('renders the Enable Tasks switch on email edition step 2', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();

      await expect
        .element(page.getByRole('switch', { name: 'Enable Tasks' }))
        .toBeVisible();
    });

    it('renders the Enable Chat switch on workspace edition step 2', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect
        .element(page.getByRole('switch', { name: 'Enable Chat' }))
        .toBeVisible();
    });

    it('navigates back from workspace edition step 2 to step 1', async () => {
      await setupWizardTest();
      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('radio', { name: 'Workspace edition' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'BACK' }).click();

      await expect
        .element(page.getByRole('button', { name: 'Next' }))
        .toBeVisible();
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
  });

  describe('Create COS', () => {
    it('should send CreateCos SOAP request and navigate on successful creation', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      const requestBody = (await createCosPromise) as Record<string, unknown>;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.name).toEqual({ _content: 'testcos' });

      await expect
        .element(page.getByText('testcos has been created successfully'))
        .toBeVisible();
      expect(replaceHistoryMock).toHaveBeenCalledWith(
        `/${NEW_COS_ID}/general_information`,
      );
    });

    it('should include description and notes in the CreateCos request', async () => {
      const createCosPromise = createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
      await setupWizardTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
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

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'create' }).click();

      await expect.element(page.getByText('Server error occurred')).toBeVisible();
    });
  });
});
