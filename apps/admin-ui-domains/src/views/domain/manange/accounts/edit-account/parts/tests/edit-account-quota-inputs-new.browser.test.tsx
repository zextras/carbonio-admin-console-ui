/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDomainStore } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { EditAccountQuotaInputsNew } from '../edit-account-quota-inputs-new';

const defaultQuotaLimit = 10737418240;

function setupAdvancedTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  return setupBrowserTest(component, { queryClient });
}

function setupNotAdvancedTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: false });
  return setupBrowserTest(component, { queryClient });
}

describe('EditAccountQuotaInputsNew', () => {
  afterEach(() => {
    useDomainStore.setState({ domain: { id: undefined }, domainsQuota: {} });
  });

  it('should render the total quota input when advanced is supported', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={defaultQuotaLimit} onChange={vi.fn()} />,
    );

    await expect.element(page.getByText('Total quota(GB)')).toBeVisible();
  });

  it('should render nothing when advanced is not supported', async () => {
    const { container } = await setupNotAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={defaultQuotaLimit} onChange={vi.fn()} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should allow numeric input', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={defaultQuotaLimit} onChange={vi.fn()} />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await input.fill('123');

    await expect.element(input).toHaveValue('123');
  });

  it('should render an empty input when a zero value is passed as prop', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={0} onChange={vi.fn()} />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });

    await expect.element(input).toHaveValue('');
  });

  it('should render an empty input when an undefined value is passed as prop', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={undefined} onChange={vi.fn()} />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });

    await expect.element(input).toHaveValue('');
  });

  it('should strip non-numeric characters from input', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={0} onChange={vi.fn()} />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.type(input, 'abc');

    await expect.element(input).toHaveValue('');
  });

  it('should strip a zero value from input', async () => {
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={20000} onChange={vi.fn()} />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);
    await userEvent.type(input, '0');
    await expect.element(input).toHaveValue('');
  });

  it('should call onChange with the value in bytes when input changes', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={onChangeMock}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);
    await userEvent.type(input, '10');

    expect(onChangeMock).toHaveBeenLastCalledWith({
      type: 'limited',
      value: 10737418240,
    });
  });

  it('should call onChange with undefined when input is cleared', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={onChangeMock}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);

    expect(onChangeMock).toHaveBeenLastCalledWith(undefined);
  });

  it('should call onChange with undefined when user inputs zero ', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={onChangeMock}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);
    await userEvent.type(input, '0');

    expect(onChangeMock).toHaveBeenLastCalledWith(undefined);
  });

  it('should disable the unlimited switch when domainQuotaConstraint is defined', async () => {
    useDomainStore.setState({
      domain: { id: 'test-domain' },
      domainsQuota: { 'test-domain': 10737418240 },
    });

    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={defaultQuotaLimit} onChange={vi.fn()} />,
    );

    // Verify the component is rendered first
    await expect.element(page.getByText('Unlimited quota')).toBeVisible();

    // Check that the switch is disabled by verifying the icon wrapper has tabindex="-1"
    const iconWrapper = document.querySelector('[class*="iconWrapper"]');
    expect(iconWrapper?.getAttribute('tabindex')).toBe('-1');
  });

  it('should enable the unlimited switch when domainQuotaConstraint is not-set', async () => {
    useDomainStore.setState({
      domain: { id: 'test-domain' },
      domainsQuota: { 'test-domain': 'not-set' },
    });

    await setupAdvancedTest(
      <EditAccountQuotaInputsNew totalComputedQuotaLimit={defaultQuotaLimit} onChange={vi.fn()} />,
    );

    // Verify the component is rendered first
    await expect.element(page.getByText('Unlimited quota')).toBeVisible();

    // Check that the switch is disabled by verifying the icon wrapper has tabindex="-1"
    const iconWrapper = document.querySelector('[class*="iconWrapper"]');
    expect(iconWrapper?.getAttribute('tabindex')).toBe('0');
  });

  it('should render the reset icon when source is account and call onClick handler when clicked', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={defaultQuotaLimit}
        totalQuotaSource="account"
        onChange={onChangeMock}
      />,
    );

    const resetIcon = page.getByTestId('icon: RefreshOutline');
    await expect.element(resetIcon).toBeVisible();

    await userEvent.click(resetIcon);
    expect(onChangeMock).toHaveBeenCalledWith(undefined);
  });

  it.each(['global', 'domain', 'cos'] as const)(
    'should not render the reset icon when source is %s',
    async (source) => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          totalQuotaSource={source}
          onChange={onChangeMock}
        />,
      );

      await expect.element(page.getByRole('textbox', { name: 'Total quota(GB)' })).toBeVisible();

      const resetIcons = document.querySelectorAll('[data-testid="icon: RefreshOutline"]');
      expect(resetIcons).toHaveLength(0);
    },
  );

  it('should not render the reset icon when source is undefined', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={onChangeMock}
      />,
    );

    // Verify the input is rendered
    await expect.element(page.getByRole('textbox', { name: 'Total quota(GB)' })).toBeVisible();

    // Verify the reset icon is not rendered
    const resetIcons = document.querySelectorAll('[data-testid="icon: RefreshOutline"]');
    expect(resetIcons).toHaveLength(0);
  });

  describe('Domain quota constraint description', () => {
    it('should show proper description under the input when a domain constraint is set', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      useDomainStore.setState({
        domain: { id: 'test-domain' },
        domainsQuota: { 'test-domain': domainConstraint },
      });

      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
      );

      // Verify the description is shown with the correct constraint value
      const description = page.getByText(/The maximum allowed value is 10 GB/);
      await expect.element(description).toBeVisible();
    });

    it('should not show description under the input when a domain constraint is not set', async () => {
      useDomainStore.setState({
        domain: { id: 'test-domain' },
        domainsQuota: { 'test-domain': 'not-set' },
      });

      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
      );

      // Verify the description is not shown
      expect(document.body.textContent).not.toContain('maximum allowed value');
    });

    it('should show a proper error description when user tries to exceed the constraint value', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      useDomainStore.setState({
        domain: { id: 'test-domain' },
        domainsQuota: { 'test-domain': domainConstraint },
      });

      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
      );

      // Get the input and enter a value that exceeds the constraint (15 GB)
      const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
      await userEvent.clear(input);
      await userEvent.type(input, '15');

      // Verify the error description is shown
      await expect.element(
        page.getByText(/This value exceeds the domain limit \(10 GB\)\. Please enter a lower value\./),
      ).toBeVisible();
    });
  });
});
