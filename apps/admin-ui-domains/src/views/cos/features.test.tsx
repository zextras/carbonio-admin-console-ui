/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
    expect(screen.getByRole('switch', { name: 'Mail Signatures' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Out of Office Reply' })).toBeTruthy();
    expect(
      screen.getByRole('switch', { name: 'Allow user to import external mailbox' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('switch', { name: 'Allow user to export their mailbox' }),
    ).toBeTruthy();
  });

  it('reflects the initial form values on the import/export switches', () => {
    renderFeatures();
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to import external mailbox' })
        .getAttribute('aria-checked'),
    ).toBe('false');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to export their mailbox' })
        .getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('toggles the import switch independently from the export switch', () => {
    renderFeatures();

    const importSwitch = screen.getByRole('switch', {
      name: 'Allow user to import external mailbox',
    });
    const exportSwitch = screen.getByRole('switch', {
      name: 'Allow user to export their mailbox',
    });

    expect(importSwitch.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(importSwitch);
    expect(importSwitch.getAttribute('aria-checked')).toBe('true');

    // Unrelated switch must not be affected.
    expect(exportSwitch.getAttribute('aria-checked')).toBe('true');
  });

  it('falls back to the inherited CoS value when no account-specific value is set', () => {
    renderFeatures({
      initialFeaturesDetail: {},
      cosDetail: { zimbraFeatureImportFolderEnabled: 'TRUE' },
    });

    expect(
      screen
        .getByRole('switch', { name: 'Allow user to import external mailbox' })
        .getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('disables the import/export switches when readonlyFeatures is true', () => {
    renderFeatures({ readonlyFeatures: true });

    expect(
      screen
        .getByRole('switch', { name: 'Allow user to import external mailbox' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    expect(
      screen
        .getByRole('switch', { name: 'Allow user to export their mailbox' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
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
