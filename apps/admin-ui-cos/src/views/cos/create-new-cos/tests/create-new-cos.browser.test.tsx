/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
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
});
