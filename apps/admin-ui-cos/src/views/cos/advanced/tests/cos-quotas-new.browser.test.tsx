/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ComputedLimit } from '../../../../services/get-cos-quota';
import COSQuotasNew from '../cos-quotas-new';

const limitedQuota: ComputedLimit = { type: 'limited', value: 10737418240 }; // 10 GB
const unlimitedQuota: ComputedLimit = { type: 'unlimited' };

describe('COSQuotasNew (browser)', () => {
  it('should render the unlimited quota switch and total quota input', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={vi.fn()}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    await expect.element(page.getByText('Unlimited quota')).toBeVisible();
    await expect.element(page.getByText('Total quota(GB)')).toBeVisible();
  });

  it('should call onChange with limited value in bytes when input changes', async () => {
    const onChangeMock = vi.fn();
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={onChangeMock}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.fill(input, '5');

    expect(onChangeMock).toHaveBeenLastCalledWith({
      type: 'limited',
      value: 5368709120,
    });
  });

  it('should call onChange with undefined when input is cleared', async () => {
    const onChangeMock = vi.fn();
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={onChangeMock}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.clear(input);

    expect(onChangeMock).toHaveBeenLastCalledWith(undefined);
  });

  it('should call onChange with unlimited when switch is toggled on', async () => {
    const onChangeMock = vi.fn();
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={onChangeMock}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const switchIcon = page.getByTestId('icon: ToggleLeftOutline');
    await userEvent.click(switchIcon);

    expect(onChangeMock).toHaveBeenLastCalledWith({ type: 'unlimited' });
  });

  it('should disable the input when unlimited is active', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={unlimitedQuota}
        initialTotalComputedQuotaLimit={unlimitedQuota}
        onChange={vi.fn()}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await expect.element(input).toBeDisabled();
  });

  it('should restore initial limited value when switch is toggled off', async () => {
    const onChangeMock = vi.fn();
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={unlimitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={onChangeMock}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const switchIcon = page.getByTestId('icon: ToggleRight');
    await userEvent.click(switchIcon);

    expect(onChangeMock).toHaveBeenLastCalledWith({
      type: 'limited',
      value: 10737418240,
    });
  });

  it('should strip non-numeric characters from input', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={undefined}
        initialTotalComputedQuotaLimit={undefined}
        onChange={vi.fn()}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await userEvent.fill(input, 'abc');

    await expect.element(input).toHaveValue('');
  });

  it('should disable input when readonlyCOS is true', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={vi.fn()}
        readonlyCOS={true}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await expect.element(input).toBeDisabled();
  });

  it('should render revert icon when showRevertButton is true', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        totalQuotaSource={'cos'}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={vi.fn()}
        readonlyCOS={false}
        showRevertButton={true}
      />,
    );

    const revertIcon = page.getByTestId('icon: RefreshOutline');
    await expect.element(revertIcon).toBeVisible();

    await userEvent.hover(revertIcon);
    await expect.element(page.getByText('Click to revert to the inherited value')).toBeVisible();
  });

  it('should call onChange with undefined when revert icon is clicked', async () => {
    const onChangeMock = vi.fn();
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={limitedQuota}
        totalQuotaSource={'cos'}
        initialTotalComputedQuotaLimit={limitedQuota}
        onChange={onChangeMock}
        readonlyCOS={false}
        showRevertButton={true}
      />,
    );

    await userEvent.click(page.getByTestId('icon: RefreshOutline'));

    expect(onChangeMock).toHaveBeenLastCalledWith(undefined);
  });

  it('should render empty input when quota limit is undefined', async () => {
    await setupBrowserTest(
      <COSQuotasNew
        totalComputedQuotaLimit={undefined}
        initialTotalComputedQuotaLimit={undefined}
        onChange={vi.fn()}
        readonlyCOS={false}
        showRevertButton={false}
      />,
    );

    const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
    await expect.element(input).toHaveValue('');
  });
});
