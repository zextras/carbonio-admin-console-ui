/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { useAccountForm } from '../account-form-context';
import {
  computeGracePeriodDefaultDate,
  GracePeriodDatePicker,
} from '../security-section/grace-period';
import { AccountFormTestProvider } from './account-form-test-provider';

const GRACE_FLAGS = {
  carbonioOtpGracePeriodEnabled: 'TRUE',
  carbonioOtpWizardFromUntrusted: 'TRUE',
  carbonioFeatureOTPMgmtEnabled: 'TRUE',
};

describe('computeGracePeriodDefaultDate (unit)', () => {
  it('parses a Zimbra gentime string into a UTC date', () => {
    expect(computeGracePeriodDefaultDate('20260615100000Z', 'TRUE')?.toISOString()).toBe(
      '2026-06-15T10:00:00.000Z',
    );
  });

  it('falls back to one month ahead when enabled without a stored value', () => {
    const expected = new Date();
    expected.setMonth(expected.getMonth() + 1);
    const result = computeGracePeriodDefaultDate(undefined, 'TRUE');
    expect(result?.getMonth()).toBe(expected.getMonth());
    expect(result?.getFullYear()).toBe(expected.getFullYear());
  });

  it('returns null when disabled and no stored value exists', () => {
    expect(computeGracePeriodDefaultDate(undefined, undefined)).toBeNull();
    expect(computeGracePeriodDefaultDate(undefined, '')).toBeNull();
  });

  it('falls back to one month ahead for malformed gentime values while enabled', () => {
    const result = computeGracePeriodDefaultDate('not-a-date', 'TRUE');
    expect(result).not.toBeNull();
  });

  it('returns null for malformed gentime values while disabled', () => {
    expect(computeGracePeriodDefaultDate('not-a-date', '')).toBeNull();
  });
});

describe('GracePeriodDatePicker (browser)', () => {
  it('shows the date parsed from the stored grace period ending time', async () => {
    setupBrowserTest(
      <AccountFormTestProvider
        values={{
          ...GRACE_FLAGS,
          carbonioOtpGracePeriodEndingTime: '20260615100000Z',
        }}
      >
        <GracePeriodDatePicker />
      </AccountFormTestProvider>,
    );

    await expect
      .element(page.getByRole('textbox', { name: /set grace period expiration date/i }))
      .toHaveValue('15/06/2026');
  });

  it('is disabled while the grace period is not fully enabled', async () => {
    setupBrowserTest(
      <AccountFormTestProvider
        values={{
          carbonioOtpGracePeriodEnabled: 'FALSE',
          carbonioOtpWizardFromUntrusted: 'TRUE',
          carbonioFeatureOTPMgmtEnabled: 'TRUE',
        }}
      >
        <GracePeriodDatePicker />
      </AccountFormTestProvider>,
    );

    await expect
      .element(page.getByRole('textbox', { name: /set grace period expiration date/i }))
      .toBeDisabled();
  });

  it('is enabled when all grace period flags are TRUE', async () => {
    setupBrowserTest(
      <AccountFormTestProvider values={GRACE_FLAGS}>
        <GracePeriodDatePicker />
      </AccountFormTestProvider>,
    );

    await expect
      .element(page.getByRole('textbox', { name: /set grace period expiration date/i }))
      .toBeEnabled();
  });
});

const GracePeriodStoreProbe = () => {
  const { form } = useAccountForm();
  const values = useSelector(form.store, (s) => s.values as Record<string, string>);
  return <p>{`probe-grace:${values?.carbonioOtpGracePeriodEndingTime ?? ''}`}</p>;
};

function buildGentime(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(
    date.getUTCDate(),
  ).padStart(2, '0')}${String(date.getUTCHours()).padStart(2, '0')}${String(
    date.getUTCMinutes(),
  ).padStart(2, '0')}${String(date.getUTCSeconds()).padStart(2, '0')}Z`;
}

describe('GracePeriodDatePicker interactions (browser)', () => {
  it('defaults to one month ahead and stores a gentime when the user picks a date', async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setupBrowserTest(
      <AccountFormTestProvider values={GRACE_FLAGS}>
        <>
          <GracePeriodDatePicker />
          <GracePeriodStoreProbe />
        </>
      </AccountFormTestProvider>,
    );

    const input = page.getByRole('textbox', { name: /set grace period expiration date/i });
    await expect.element(input).toBeVisible();
    const initialValue = (input.element() as HTMLInputElement).value;
    expect(initialValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    await expect.element(page.getByText('probe-grace:', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Calendar' }).click();
    await expect.element(page.getByRole('grid')).toBeVisible();

    await page.getByRole('button', { name: 'Go to the Next Month' }).click();
    await expect
      .element(page.getByRole('grid', { name: format(nextMonth, 'LLLL yyyy') }))
      .toBeVisible();
    await page.getByRole('gridcell').filter({ hasText: '10' }).click();

    await expect.element(page.getByText(/^probe-grace:\d{14}Z$/)).toBeVisible();
    const pickedValue = (input.element() as HTMLInputElement).value;
    expect(pickedValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('clears the stored ending time when the selected day is toggled off', async () => {
    const target = new Date();
    target.setMonth(target.getMonth() + 2);
    target.setDate(15);
    const gentime = buildGentime(target);

    setupBrowserTest(
      <AccountFormTestProvider
        values={{ ...GRACE_FLAGS, carbonioOtpGracePeriodEndingTime: gentime }}
      >
        <>
          <GracePeriodDatePicker />
          <GracePeriodStoreProbe />
        </>
      </AccountFormTestProvider>,
    );

    const input = page.getByRole('textbox', { name: /set grace period expiration date/i });
    await expect.element(input).toHaveValue(format(target, 'dd/MM/yyyy'));
    await expect.element(page.getByText(`probe-grace:${gentime}`)).toBeVisible();

    await page.getByRole('button', { name: 'Calendar' }).click();
    await expect.element(page.getByRole('grid')).toBeVisible();

    const nextMonthButton = page.getByRole('button', { name: 'Go to the Next Month' });
    await nextMonthButton.click();
    await nextMonthButton.click();
    await expect
      .element(page.getByRole('grid', { name: format(target, 'LLLL yyyy') }))
      .toBeVisible();

    await page.getByRole('gridcell').filter({ hasText: '15' }).click();

    await expect.element(page.getByText('probe-grace:', { exact: true })).toBeVisible();
    const fallbackMonth = new Date();
    fallbackMonth.setMonth(fallbackMonth.getMonth() + 1);
    await expect.element(input).toHaveValue(format(fallbackMonth, 'dd/MM/yyyy'));
  });
});
