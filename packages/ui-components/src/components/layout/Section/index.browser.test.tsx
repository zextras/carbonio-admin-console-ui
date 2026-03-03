/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Section, WizardInSection } from './index';

describe('Section component', () => {
  test('renders children correctly', async () => {
    await setupBrowserTest(
      <Section title={'section title'} divider={false} onClose={vi.fn()}>
        <div>Test Child</div>
      </Section>,
    );
    await expect.element(page.getByText('Test Child')).toBeVisible();
  });

  test('renders title and footer correctly', async () => {
    const title = 'Test Title';
    const footer = <div>Test Footer</div>;

    await setupBrowserTest(
      <Section title={title} footer={footer} divider={false} onClose={vi.fn()}>
        {undefined}
      </Section>,
    );

    await expect.element(page.getByText(title)).toBeVisible();
    await expect.element(page.getByText('Test Footer')).toBeVisible();
  });

  test('calls onClose when close button is clicked', async () => {
    const onCloseMock = vi.fn();

    await setupBrowserTest(
      <Section showClose onClose={onCloseMock} title="" divider={false}>
        {undefined}
      </Section>,
    );

    const closeButton = page.getByTestId('close-button');
    await closeButton.click();

    expect(onCloseMock).toHaveBeenCalled();
  });
});

describe('WizardInSection component', () => {
  test('renders wizard content correctly', async () => {
    const setToggleMock = vi.fn();

    await setupBrowserTest(
      <WizardInSection
        title="Test Wizard"
        wizard={<div>Wizard Content</div>}
        setToggleWizardSection={setToggleMock}
      />,
    );

    await expect.element(page.getByText('Test Wizard')).toBeVisible();
    await expect.element(page.getByText('Wizard Content')).toBeVisible();
  });

  test('renders with footer', async () => {
    const setToggleMock = vi.fn();

    await setupBrowserTest(
      <WizardInSection
        title="Test Wizard"
        wizard={<div>Wizard Content</div>}
        wizardFooter={<div>Footer Content</div>}
        setToggleWizardSection={setToggleMock}
      />,
    );

    await expect.element(page.getByText('Footer Content')).toBeVisible();
  });

  test('calls setToggleWizardSection(false) when close button is clicked', async () => {
    const setToggleMock = vi.fn();

    await setupBrowserTest(
      <WizardInSection
        title="Test Wizard"
        wizard={<div>Wizard Content</div>}
        setToggleWizardSection={setToggleMock}
      />,
    );

    const closeButton = page.getByTestId('close-button');
    await closeButton.click();

    expect(setToggleMock).toHaveBeenCalledWith(false);
  });
});
