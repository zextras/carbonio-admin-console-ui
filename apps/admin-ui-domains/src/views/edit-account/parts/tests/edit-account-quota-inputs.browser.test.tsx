/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { domainQueryKeys } from '../../../../services/domain-query-keys';
import { QuotaLimitInput } from '../edit-account-quota-inputs';

const defaultQuotaLimit = 10737418240;

function setupAdvancedTest(component: React.ReactElement, quotaLimit?: number) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  if (typeof quotaLimit === 'number') {
    queryClient.setQueryData(domainQueryKeys.quota('test-domain'), {
      type: 'success',
      limit: quotaLimit,
    });
  }
  return setupBrowserTest(component, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: '/test-domain',
  });
}

function setupNotAdvancedTest(component: React.ReactElement) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: false });
  return setupBrowserTest(component, { queryClient });
}

describe('QuotaLimitInput', () => {
  it('should render the total quota input when advanced is supported', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={vi.fn()}
      />,
    );

    await expect.element(page.getByText('Total quota(GB)')).toBeVisible();
  });

  it('should render nothing when advanced is not supported', async () => {
    const { container } = await setupNotAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should allow numeric input', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={vi.fn()}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await input.fill('123');

    await expect.element(input).toHaveValue('123');
  });

  it('should render an empty input when a zero value is passed as prop', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={0}
        onChange={vi.fn()}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });

    await expect.element(input).toHaveValue('');
  });

  it('should render an empty input when an undefined value is passed as prop', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={undefined}
        onChange={vi.fn()}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });

    await expect.element(input).toHaveValue('');
  });

  it('should strip non-numeric characters from input', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={0}
        onChange={vi.fn()}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.type(input, 'abc');

    await expect.element(input).toHaveValue('');
  });

  it('should strip a zero value from input', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={20000}
        onChange={vi.fn()}
      />,
    );
    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);
    await userEvent.type(input, '0');
    await expect.element(input).toHaveValue('');
  });

  it('should call onChange with the value in bytes when input changes', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <QuotaLimitInput
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
      <QuotaLimitInput
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
      <QuotaLimitInput
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
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={vi.fn()}
      />,
      10737418240,
    );

    // Verify the component is rendered first
    await expect.element(page.getByText('Unlimited quota')).toBeVisible();

    const switchElement = document.querySelector('[role="switch"]');
    expect(switchElement?.getAttribute('aria-disabled')).toBe('true');
  });

  it('should enable the unlimited switch when domainQuotaConstraint is not-set', async () => {
    await setupAdvancedTest(
      <QuotaLimitInput
        totalComputedQuotaLimit={defaultQuotaLimit}
        onChange={vi.fn()}
      />,
    );

    // Verify the component is rendered first
    await expect.element(page.getByText('Unlimited quota')).toBeVisible();

    const switchElement = document.querySelector('[role="switch"]');
    expect(switchElement?.getAttribute('aria-disabled')).toBeNull();
  });

  it('should render the reset icon when source is account and call onClick handler when clicked', async () => {
    const onChangeMock = vi.fn();
    await setupAdvancedTest(
      <QuotaLimitInput
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
        <QuotaLimitInput
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
      <QuotaLimitInput
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
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      // Verify the description is shown with the correct constraint value
      const description = page.getByText(
        /The maximum allowed value is 10 GB. Unlimited is not available./,
      );
      await expect.element(description).toBeVisible();
    });

    it('should not show description under the input when a domain constraint is not set', async () => {
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
      );

      // Verify the description is not shown
      expect(document.body.textContent).not.toContain('maximum allowed value');
    });

    it('should show a proper error description when user tries to exceed the constraint value', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      // Get the input and enter a value that exceeds the constraint (15 GB)
      const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
      await userEvent.clear(input);
      await userEvent.type(input, '15');

      // Verify the error description is shown
      await expect
        .element(
          page.getByText(
            /This value exceeds the domain limit \(10 GB\)\. Please enter a lower value\./,
          ),
        )
        .toBeVisible();
    });
  });

  describe('Tooltip cases', () => {
    it('should show tooltip with inherited value (10 GB) from domain when source is account', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          totalQuotaSource="account"
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      const resetIcon = page.getByTestId('icon: RefreshOutline');
      await userEvent.hover(resetIcon);

      // Verify tooltip shows inherited value with the calculated value (10)
      await expect.element(page.getByText(/The inherited value was: 10/)).toBeVisible();
      await expect.element(page.getByText('Click to revert')).toBeVisible();
    });

    it('should show tooltip with inherited value (5 GB) from COS when source is account', async () => {
      const cosLimit = 5368709120; // 5 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          cosComputedLimit={cosLimit}
          totalQuotaSource="account"
          onChange={vi.fn()}
        />,
      );

      const resetIcon = page.getByTestId('icon: RefreshOutline');
      await userEvent.hover(resetIcon);

      // Verify tooltip shows inherited value from COS with the calculated value (5)
      await expect.element(page.getByText(/The inherited value was: 5/)).toBeVisible();
    });

    it('should show tooltip with minimum value (5 GB) when both domain (10 GB) and COS (5 GB) quotas are set: COS wins', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      const cosLimit = 5368709120; // 5 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          cosComputedLimit={cosLimit}
          totalQuotaSource="account"
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      const resetIcon = page.getByTestId('icon: RefreshOutline');
      await userEvent.hover(resetIcon);

      // Should show the minimum value (5 GB from COS) in the inherited value tooltip
      await expect.element(page.getByText(/The inherited value was: 5/)).toBeVisible();
    });

    it('should show tooltip with minimum value (5 GB) when both domain (5 GB) and COS (10 GB) quotas are set: Domain wins', async () => {
      const domainConstraint = 5368709120; // 10 GB in bytes
      const cosLimit = 10737418240; // 5 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          cosComputedLimit={cosLimit}
          totalQuotaSource="account"
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      const resetIcon = page.getByTestId('icon: RefreshOutline');
      await userEvent.hover(resetIcon);

      // Should show the minimum value (5 GB from COS) in the inherited value tooltip
      await expect.element(page.getByText(/The inherited value was: 5/)).toBeVisible();
    });

    it('should not show tooltip when source is not account', async () => {
      const domainConstraint = 10737418240; // 10 GB in bytes
      await setupAdvancedTest(
        <QuotaLimitInput
          totalComputedQuotaLimit={defaultQuotaLimit}
          totalQuotaSource="domain"
          onChange={vi.fn()}
        />,
        domainConstraint,
      );

      expect(document.body.textContent).not.toContain('The inherited value was');
      expect(document.body.textContent).not.toContain('Click to revert');
    });
  });
});
