/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { useLicenseV1Feature, useNewSubscriptionFeatureFlag } from '@zextras/ui-shared';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Features } from './features';

type FeaturesDetail = Record<string, string>;

const defaultFeaturesDetail: FeaturesDetail = {
  zimbraFeatureSignaturesEnabled: 'TRUE',
  zimbraFeatureOutOfOfficeReplyEnabled: 'FALSE',
  zimbraFeatureImportFolderEnabled: 'FALSE',
  zimbraFeatureExportFolderEnabled: 'TRUE',
};

function Harness({
  initialFeaturesDetail = defaultFeaturesDetail,
  cosDetail,
  accSpecificDetail,
  setEmptyValue,
  readonlyFeatures,
}: {
  initialFeaturesDetail?: FeaturesDetail;
  cosDetail?: FeaturesDetail;
  accSpecificDetail?: FeaturesDetail;
  setEmptyValue?: CallableFunction;
  readonlyFeatures?: boolean;
}): React.JSX.Element {
  const [featuresDetail, setFeaturesDetail] = useState(initialFeaturesDetail);
  return (
    <Features
      featuresDetail={featuresDetail}
      setFeaturesDetail={setFeaturesDetail}
      cosDetail={cosDetail}
      accSpecificDetail={accSpecificDetail}
      setEmptyValue={setEmptyValue}
      readonlyFeatures={readonlyFeatures}
    />
  );
}

function renderFeatures(
  props: Omit<Parameters<typeof Harness>[0], 'initialFeaturesDetail'> & {
    initialFeaturesDetail?: FeaturesDetail;
  } = {},
): ReturnType<typeof render> {
  return render(<Harness {...props} />);
}

describe('Features - Mail section', () => {
  it('renders the Mail title and all four mail switches, including the import/export ones', () => {
    renderFeatures();
    expect(screen.getByText('Mail', { exact: true })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Mail Signatures' })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Out of Office Reply' })).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>('switch', { name: 'Allow user to import external mailbox' }),
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>('switch', { name: 'Allow user to export their mailbox' }),
    ).toBeTruthy();
  });

  it('reflects the initial form values on the import/export switches', () => {
    renderFeatures();
    expect(
      screen
        .getByRole<HTMLInputElement>('switch', { name: 'Allow user to import external mailbox' })
        .checked,
    ).toBe(false);
    expect(
      screen
        .getByRole<HTMLInputElement>('switch', { name: 'Allow user to export their mailbox' })
        .checked,
    ).toBe(true);
  });

  it('toggles the import switch independently from the export switch', () => {
    renderFeatures();

    const importSwitch = screen.getByRole<HTMLInputElement>('switch', {
      name: 'Allow user to import external mailbox',
    });
    const exportSwitch = screen.getByRole<HTMLInputElement>('switch', {
      name: 'Allow user to export their mailbox',
    });

    expect(importSwitch.checked).toBe(false);
    fireEvent.click(importSwitch);
    expect(importSwitch.checked).toBe(true);

    // Unrelated switch must not be affected.
    expect(exportSwitch.checked).toBe(true);
  });

  it('falls back to the inherited CoS value when no account-specific value is set', () => {
    renderFeatures({
      initialFeaturesDetail: {},
      cosDetail: { zimbraFeatureImportFolderEnabled: 'TRUE' },
    });

    expect(
      screen
        .getByRole<HTMLInputElement>('switch', { name: 'Allow user to import external mailbox' })
        .checked,
    ).toBe(true);
  });

  it('disables the import/export switches when readonlyFeatures is true', () => {
    renderFeatures({ readonlyFeatures: true });

    expect(
      screen
        .getByRole<HTMLInputElement>('switch', { name: 'Allow user to import external mailbox' })
        .disabled,
    ).toBe(true);
    expect(
      screen
        .getByRole<HTMLInputElement>('switch', { name: 'Allow user to export their mailbox' })
        .disabled,
    ).toBe(true);
  });

  it('shows a reset control for the export switch when it comes from an account-specific override, and resetting it calls setEmptyValue', () => {
    const setEmptyValue = vi.fn();
    renderFeatures({
      accSpecificDetail: { zimbraFeatureExportFolderEnabled: 'TRUE' },
      setEmptyValue,
    });

    const resetButton = screen.getByTestId('reset-zimbraFeatureExportFolderEnabled');
    expect(resetButton).toBeTruthy();

    fireEvent.click(resetButton);
    expect(setEmptyValue).toHaveBeenCalledWith('zimbraFeatureExportFolderEnabled');
  });

  it('does not show a reset control for the import switch when there is no account-specific override', () => {
    renderFeatures();
    expect(screen.queryByTestId('reset-zimbraFeatureImportFolderEnabled')).toBeNull();
  });
});

function mockFilesLicensed(isLicensed: boolean): void {
  vi.mocked(useLicenseV1Feature).mockReturnValue({ data: isLicensed } as ReturnType<
    typeof useLicenseV1Feature
  >);
}

describe('Features - Files section visibility (new-subscriptions flag enabled)', () => {
  beforeEach(() => {
    vi.mocked(useNewSubscriptionFeatureFlag).mockReturnValue(true);
  });

  it('asks the license whether Files is allowed', () => {
    mockFilesLicensed(true);
    renderFeatures({ cosDetail: { edition: 'workspace' } });

    expect(useLicenseV1Feature).toHaveBeenCalledWith('Files');
  });

  it('shows the Files heading and switch when the COS edition is workspace and the license allows Files', () => {
    mockFilesLicensed(true);
    renderFeatures({ cosDetail: { edition: 'workspace' } });

    expect(screen.getByText('Files', { exact: true })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Allow access to Files' })).toBeTruthy();
  });

  it('hides the Files heading and switch when the license does not allow Files, even on a workspace COS', () => {
    mockFilesLicensed(false);
    renderFeatures({ cosDetail: { edition: 'workspace' } });

    expect(screen.queryByText('Files', { exact: true })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Allow access to Files' })).toBeNull();
  });

  it('hides the Files heading and switch when the COS edition is mail, even if the license allows Files', () => {
    mockFilesLicensed(true);
    renderFeatures({ cosDetail: { edition: 'mail' } });

    expect(screen.queryByText('Files', { exact: true })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Allow access to Files' })).toBeNull();
  });

  it('keeps the Allow access to Tasks switch visible when Files is hidden', () => {
    mockFilesLicensed(false);
    renderFeatures({ cosDetail: { edition: 'mail' } });

    expect(screen.getByRole<HTMLInputElement>('switch', { name: 'Allow access to Tasks' })).toBeTruthy();
  });

  it('hides the Allow access to Files switch when the COS has no edition attribute', () => {
    mockFilesLicensed(true);
    renderFeatures({ cosDetail: { zimbraFeatureContactsEnabled: 'TRUE' } });

    expect(screen.queryByRole('switch', { name: 'Allow access to Files' })).toBeNull();
  });

  it('hides the Allow access to Files switch while the license is still loading', () => {
    vi.mocked(useLicenseV1Feature).mockReturnValue({ data: undefined } as ReturnType<
      typeof useLicenseV1Feature
    >);
    renderFeatures({ cosDetail: { edition: 'workspace' } });

    expect(screen.queryByRole('switch', { name: 'Allow access to Files' })).toBeNull();
  });
});

describe('Features - Files section vs new-subscriptions feature flag', () => {
  it('shows the Files heading and the Allow access to Files switch when the flag is disabled and the license does not allow Files', () => {
    vi.mocked(useNewSubscriptionFeatureFlag).mockReturnValue(false);
    mockFilesLicensed(false);
    renderFeatures({ cosDetail: { edition: 'mail' } });

    expect(screen.getByText('Files', { exact: true })).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>('switch', { name: 'Allow access to Files' }),
    ).toBeTruthy();
  });
});
