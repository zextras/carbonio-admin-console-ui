/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { render } from 'vitest-browser-react';
import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Section, WizardInSection } from './index';

describe('Section component', () => {
  test('renders children correctly', async () => {
    await render(
      <Section title={'section title'} divider={false} onClose={vi.fn()}>
        <div>Test Child</div>
      </Section>,
    );
    await expect.element(page.getByText('Test Child')).toBeVisible();
  });

  test('renders title and footer correctly', async () => {
    const title = 'Test Title';
    const footer = <div>Test Footer</div>;

    await render(
      <Section title={title} footer={footer} divider={false} onClose={vi.fn()}>
        {undefined}
      </Section>,
    );

    await expect.element(page.getByText(title)).toBeVisible();
    await expect.element(page.getByText('Test Footer')).toBeVisible();
  });

  test('calls onClose when close button is clicked', async () => {
    const onCloseMock = vi.fn();

    await render(
      <Section showClose onClose={onCloseMock} title="" divider={false}>
        {undefined}
      </Section>,
    );

    const closeButton = page.getByTestId('close-button').last();
    await expect.element(closeButton).toBeVisible();
    await closeButton.click();

    await expect.poll(() => onCloseMock.mock.calls.length).toBe(1);
  });
});

describe('WizardInSection component', () => {
  test('renders wizard content correctly', async () => {
    const setToggleMock = vi.fn();

    await render(
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

    await render(
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

    await render(
      <WizardInSection
        title="Test Wizard"
        wizard={<div>Wizard Content</div>}
        setToggleWizardSection={setToggleMock}
      />,
    );

    const closeButton = page.getByTestId('close-button').last();
    await expect.element(closeButton).toBeVisible();
    await closeButton.click();

    await expect.poll(() => setToggleMock.mock.calls.length).toBe(1);
    expect(setToggleMock).toHaveBeenCalledWith(false);
  });
});
