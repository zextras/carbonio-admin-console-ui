/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

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
