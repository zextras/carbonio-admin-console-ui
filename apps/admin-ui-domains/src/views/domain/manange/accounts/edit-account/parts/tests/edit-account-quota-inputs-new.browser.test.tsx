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

  describe('Source icon', () => {
    it('should show global icon when totalQuotaSource is global', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'global'}
        />,
      );

      await expect.element(page.getByTestId('icon: GlobeOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is global', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'global'}
        />,
      );

      const globalIcon = page.getByTestId('icon: GlobeOutline');
      await userEvent.hover(globalIcon);

      await expect
        .element(page.getByText('Quota inherited from the global configuration'))
        .toBeVisible();
    });

    it('should show domain icon when totalQuotaSource is domain', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'domain'}
        />,
      );

      await expect.element(page.getByTestId('icon: AtOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is domain', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'domain'}
        />,
      );

      const domainIcon = page.getByTestId('icon: AtOutline');
      await userEvent.hover(domainIcon);

      await expect
        .element(page.getByText('Quota inherited from the domain settings.'))
        .toBeVisible();
    });

    it('should show cos icon when totalQuotaSource is cos', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'cos'}
        />,
      );

      await expect.element(page.getByTestId('icon: SettingsModOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is cos', async () => {
      const onChangeMock = vi.fn();
      await setupAdvancedTest(
        <EditAccountQuotaInputsNew
          totalComputedQuotaLimit={defaultQuotaLimit}
          onChange={onChangeMock}
          totalQuotaSource={'cos'}
        />,
      );

      const cosIcon = page.getByTestId('icon: SettingsModOutline');
      await userEvent.hover(cosIcon);

      await expect
        .element(page.getByText('Quota inherited from the assigned Class of Service'))
        .toBeVisible();
    });
  });
});
