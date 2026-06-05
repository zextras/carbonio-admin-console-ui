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

import { CreateCos } from '../create-new-cos';

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return {
    ...actual,
    replaceHistory: vi.fn(),
  };
});

const NEW_COS_ID = 'new-cos-123-abc';

const mockCreateCosResponse = {
  cos: [
    {
      id: NEW_COS_ID,
      name: 'testcos',
      a: [
        { n: 'zimbraId', _content: NEW_COS_ID },
        { n: 'cn', _content: 'testcos' },
        { n: 'description', _content: 'A test COS' },
        { n: 'zimbraNotes', _content: 'Some notes' },
      ],
    },
  ],
};

const replaceHistoryMock = vi.mocked(
  await import('@zextras/ui-shared').then((m) => m.replaceHistory),
);

async function setupCreateCosTest(): Promise<void> {
  await setupBrowserTest(
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/:cosId/:operation" element={<div>Cos Detail</div>} />
      <Route path="/create-new-cos" element={<CreateCos />} />
    </Routes>,
    { initialRouterEntry: '/create-new-cos' },
  );
  await expect.element(page.getByText('New COS')).toBeVisible();
}

function mockCreateCosSuccess(): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('CreateCos', mockCreateCosResponse);
}

describe('CreateCos', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the page title New COS', async () => {
      await setupCreateCosTest();
      await expect.element(page.getByText('New COS')).toBeVisible();
    });

    it('should render the General Information section header', async () => {
      await setupCreateCosTest();
      await expect.element(page.getByText('General Information')).toBeVisible();
    });

    it('should render the Cos Name input field', async () => {
      await setupCreateCosTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await expect.element(cosNameInput).toBeVisible();
    });

    it('should render the lowercase info text for COS name', async () => {
      await setupCreateCosTest();
      await expect
        .element(page.getByText('COS name must contain only lowercase letters.'))
        .toBeVisible();
    });

    it('should render the Description input field', async () => {
      await setupCreateCosTest();
      const descriptionInput = page.getByRole('textbox', { name: 'Description' });
      await expect.element(descriptionInput).toBeVisible();
    });

    it('should render the Notes textarea field', async () => {
      await setupCreateCosTest();
      const notesInput = page.getByRole('textbox', { name: 'Notes' });
      await expect.element(notesInput).toBeVisible();
    });

    it('should render the Cancel button', async () => {
      await setupCreateCosTest();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should render the Create button', async () => {
      await setupCreateCosTest();
      await expect.element(page.getByRole('button', { name: 'Create' })).toBeVisible();
    });

    it('should have the Create button disabled when cos name is empty', async () => {
      await setupCreateCosTest();
      await expect.element(page.getByRole('button', { name: 'Create' })).toBeDisabled();
    });
  });

  describe('Input interactions', () => {
    it('should type into the Cos Name input field', async () => {
      await setupCreateCosTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await userEvent.fill(cosNameInput, 'mycos');
      await expect.element(cosNameInput).toHaveValue('mycos');
    });

    it('should convert COS name to lowercase on input', async () => {
      await setupCreateCosTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await userEvent.fill(cosNameInput, 'MyCos');
      await expect.element(cosNameInput).toHaveValue('mycos');
    });

    it('should type into the Description input field', async () => {
      await setupCreateCosTest();
      const descriptionInput = page.getByRole('textbox', { name: 'Description' });
      await userEvent.fill(descriptionInput, 'A description');
      await expect.element(descriptionInput).toHaveValue('A description');
    });

    it('should type into the Notes textarea', async () => {
      await setupCreateCosTest();
      const notesInput = page.getByRole('textbox', { name: 'Notes' });
      await userEvent.fill(notesInput, 'Some notes here');
      await expect.element(notesInput).toHaveValue('Some notes here');
    });

    it('should enable the Create button when cos name is entered', async () => {
      await setupCreateCosTest();
      const cosNameInput = page.getByRole('textbox', { name: 'Cos Name' });
      await userEvent.fill(cosNameInput, 'testcos');
      await expect.element(page.getByRole('button', { name: 'Create' })).not.toBeDisabled();
    });
  });

  describe('Cancel', () => {
    it('should call replaceHistory with / when Cancel is clicked', async () => {
      await setupCreateCosTest();
      await page.getByRole('button', { name: 'Cancel' }).click();
      expect(replaceHistoryMock).toHaveBeenCalledWith('/');
    });
  });

  describe('Create COS', () => {
    it('should send CreateCos SOAP request with correct body', async () => {
      const createCosPromise = mockCreateCosSuccess();
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await userEvent.fill(page.getByRole('textbox', { name: 'Description' }), 'A test COS');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notes' }), 'Some notes');
      await page.getByRole('button', { name: 'Create' }).click();

      const requestBody = (await createCosPromise) as Record<string, unknown>;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.name).toEqual({ _content: 'testcos' });
    });

    it('should include cn, description, and zimbraNotes attributes in the request', async () => {
      const createCosPromise = mockCreateCosSuccess();
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await userEvent.fill(page.getByRole('textbox', { name: 'Description' }), 'A test COS');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notes' }), 'Some notes');
      await page.getByRole('button', { name: 'Create' }).click();

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

    it('should send empty string attributes when description and notes are not filled', async () => {
      const createCosPromise = mockCreateCosSuccess();
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Create' }).click();

      const requestBody = (await createCosPromise) as {
        a: Array<{ n: string; _content: string }>;
      };
      const descAttr = requestBody.a.find((a) => a.n === 'description');
      const notesAttr = requestBody.a.find((a) => a.n === 'zimbraNotes');
      expect(descAttr?._content).toBe('');
      expect(notesAttr?._content).toBe('');
    });

    it('should show success snackbar after successful creation', async () => {
      mockCreateCosSuccess();
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Create' }).click();

      await expect.element(page.getByText('testcos has been created successfully')).toBeVisible();
    });

    it('should call replaceHistory with the new COS detail route after creation', async () => {
      mockCreateCosSuccess();
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Create' }).click();

      await expect.element(page.getByText('testcos has been created successfully')).toBeVisible();
      expect(replaceHistoryMock).toHaveBeenCalledWith(`/${NEW_COS_ID}/general_information`);
    });
  });

  describe('Error handling', () => {
    it('should show error snackbar when CreateCos fails', async () => {
      worker.use(
        http.post('/service/admin/soap/CreateCosRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error occurred' } } } },
            { status: 500 },
          ),
        ),
      );
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Create' }).click();

      await expect.element(page.getByText('Server error occurred')).toBeVisible();
    });

    it('should remain on the form when CreateCos request fails with network error', async () => {
      worker.use(http.post('/service/admin/soap/CreateCosRequest', () => HttpResponse.error()));
      await setupCreateCosTest();

      await userEvent.fill(page.getByRole('textbox', { name: 'Cos Name' }), 'testcos');
      await page.getByRole('button', { name: 'Create' }).click();

      await expect.element(page.getByText('New COS')).toBeVisible();
      await expect.element(page.getByRole('textbox', { name: 'Cos Name' })).toHaveValue('testcos');
    });
  });
});
